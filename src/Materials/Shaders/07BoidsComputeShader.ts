import { ArcRotateCamera, ComputeShader, Constants, Engine, Mesh, MeshBuilder, Scene, ShaderMaterial, StorageBuffer, UniformBuffer, Vector3, VertexBuffer, WebGPUEngine } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";
import dat from "dat.gui";

export default class BoidsComputeShader {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Boids Compute Shader'
    this.CreateEngin().then((eng) => {
      this.engine = eng
      this.scene = this.CreateScene();
      this.engine.runRenderLoop(() => {
        this.scene.render();
      })
    })
  }

  async CreateEngin() : Promise<Engine> {
    const webGPUSupported = await WebGPUEngine.IsSupportedAsync
    if (webGPUSupported) {
      const engine = new WebGPUEngine(this.canvas)
      await engine.initAsync()
      return engine
    }
    return new Engine(this.canvas)
  }
  
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    if (!this.checkCompteShadersSupported(this.engine, scene)) {
      return scene
    }

    const simParams = {
      deltaT: 0.04,
      rule1Distance: 0.1,
      rule2Distance: 0.025,
      rule3Distance: 0.025,
      rule1Scale: 0.02,
      rule2Scale: 0.05,
      rule3Scale: 0.005,
    };

    const gui = this.getGUI()

    const boid = new Boid(1500, scene)
    const updateSimParams = () => {
      boid.updateSimParams(simParams)
    }
    Object.keys(simParams).forEach((key) => {
      gui.add(simParams, key).onChange(updateSimParams)
    })
    updateSimParams()

    scene.onBeforeRenderObservable.add(() => {
      boid.update()
    })

  
    return scene;
  }

  checkCompteShadersSupported(engine: Engine, scene: Scene) : boolean {
    const supportCS = engine.getCaps().supportComputeShaders
    if (supportCS) return true

    // text
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const txt = '浏览器目前不支持 WebGPU， 请在设置中打开功能！'

    const info = new TextBlock()
    info.text = txt
    info.width = '100%'
    info.paddingLeft = '5px'
    info.paddingRight = '5px'
    info.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    info.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    info.color = 'red'
    info.fontSize = '24px'
    info.fontStyle = 'bold'
    info.textWrapping = true
    adt.addControl(info)

    return false
  }

  getGUI(): dat.GUI {
    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    return gui
  }

}

class Boid {
  numParticles: number
  mesh: Mesh
  simParams: UniformBuffer
  vertexBuffers: VertexBuffer[][]
  particleBuffers: StorageBuffer[]
  cs1: ComputeShader
  cs2: ComputeShader
  cs: ComputeShader[]
  t: number

  constructor(numParticles: number, scene: Scene) {
    const engine = scene.getEngine()
    this.numParticles = numParticles

    // create mesh
    const boidMesh = MeshBuilder.CreatePlane('boidMesh', { size: 1 })
    this.mesh = boidMesh
    boidMesh.forcedInstanceCount = numParticles

    const mat = new ShaderMaterial('mat', scene, {
      vertexSource: boidVertexShader,
      fragmentSource: boidFragmentShader
    }, {
      attributes: ['a_pos', 'a_particlePos', 'a_particleVel']
    })
    boidMesh.material = mat

    const buffSpriteVertex = new VertexBuffer(engine, [-0.01, -0.02, 0.01, -0.02, 0.0, 0.02], 'a_pos', false, false, 2, false)
    
    boidMesh.setIndices([0, 1, 2])
    boidMesh.setVerticesBuffer(buffSpriteVertex)

    // Create uniform / storage / vertex buffers
    this.simParams = new UniformBuffer(engine, undefined, undefined, "simParams")

    this.simParams.addUniform("deltaT", 1)
    this.simParams.addUniform("rule1Distance", 1)
    this.simParams.addUniform("rule2Distance", 1)
    this.simParams.addUniform("rule3Distance", 1)
    this.simParams.addUniform("rule1Scale", 1)
    this.simParams.addUniform("rule2Scale", 1)
    this.simParams.addUniform("rule3Scale", 1)
    this.simParams.addUniform("numParticles", 1)

    const initialParticleData = new Float32Array(numParticles * 4)
    for (let i = 0; i < numParticles; ++i) {
        initialParticleData[4 * i + 0] = 2 * (Math.random() - 0.5)
        initialParticleData[4 * i + 1] = 2 * (Math.random() - 0.5)
        initialParticleData[4 * i + 2] = 2 * (Math.random() - 0.5) * 0.1
        initialParticleData[4 * i + 3] = 2 * (Math.random() - 0.5) * 0.1
    }

    this.particleBuffers = [
      new StorageBuffer(engine, initialParticleData.byteLength, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_WRITE),
      new StorageBuffer(engine, initialParticleData.byteLength, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_WRITE),
    ]

    this.particleBuffers[0].update(initialParticleData)
    this.particleBuffers[1].update(initialParticleData)

    this.vertexBuffers = [
      [
        new VertexBuffer(engine, this.particleBuffers[0].getBuffer(), "a_particlePos", false, false, 4, true, 0, 2),
        new VertexBuffer(engine, this.particleBuffers[0].getBuffer(), "a_particleVel", false, false, 4, true, 2, 2)
      ],
      [
        new VertexBuffer(engine, this.particleBuffers[1].getBuffer(), "a_particlePos", false, false, 4, true, 0, 2),
        new VertexBuffer(engine, this.particleBuffers[1].getBuffer(), "a_particleVel", false, false, 4, true, 2, 2)
      ]
    ]

    // Create compute shaders
    this.cs1 = new ComputeShader("compute1", engine, { computeSource: boidComputeShader }, {
      bindingsMapping: {
          "params": { group: 0, binding: 0 },
          "particlesA": { group: 0, binding: 1 },
          "particlesB": { group: 0, binding: 2 },
      }
    });
    this.cs1.setUniformBuffer("params", this.simParams);
    this.cs1.setStorageBuffer("particlesA", this.particleBuffers[0]);
    this.cs1.setStorageBuffer("particlesB", this.particleBuffers[1]);

    this.cs2 = new ComputeShader("compute2", engine, { computeSource: boidComputeShader }, {
      bindingsMapping: {
          "params": { group: 0, binding: 0 },
          "particlesA": { group: 0, binding: 1 },
          "particlesB": { group: 0, binding: 2 },
      }
    });
    this.cs2.setUniformBuffer("params", this.simParams);
    this.cs2.setStorageBuffer("particlesA", this.particleBuffers[1]);
    this.cs2.setStorageBuffer("particlesB", this.particleBuffers[0]);

    this.cs = [this.cs1, this.cs2];
    this.t = 0;
  
  }

  updateSimParams(simParams: { deltaT: number; rule1Distance: number; rule2Distance: number; rule3Distance: number; rule1Scale: number; rule2Scale: number; rule3Scale: number; }) {
    this.simParams.updateFloat("deltaT", simParams.deltaT)
    this.simParams.updateFloat("rule1Distance", simParams.rule1Distance)
    this.simParams.updateFloat("rule2Distance", simParams.rule2Distance)
    this.simParams.updateFloat("rule3Distance", simParams.rule3Distance)
    this.simParams.updateFloat("rule1Scale", simParams.rule1Scale)
    this.simParams.updateFloat("rule2Scale", simParams.rule2Scale)
    this.simParams.updateFloat("rule3Scale", simParams.rule3Scale)
    this.simParams.updateInt("numParticles", this.numParticles)
    this.simParams.update()

  }

  update() {
    this.cs[this.t].dispatch(Math.ceil(this.numParticles / 64));

    this.mesh.setVerticesBuffer(this.vertexBuffers[this.t][0], false);
    this.mesh.setVerticesBuffer(this.vertexBuffers[this.t][1], false);

    this.t = (this.t + 1) % 2;
  }

}

const boidVertexShader = /* wgsl */ `
  attribute vec2 a_pos;
  attribute vec2 a_particlePos;
  attribute vec2 a_particleVel;
  
  void main() {
    float angle = -atan(a_particleVel.x, a_particleVel.y);
    vec2 pos = vec2(
      a_pos.x * cos(angle) - a_pos.y * sin(angle),
      a_pos.x * sin(angle) + a_pos.y * cos(angle)
    );
    gl_Position = vec4(pos + a_particlePos, 0.0, 1.0);
  }
`
const boidFragmentShader =  /* wgsl */ `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`
const boidComputeShader =  /* wgsl */ `
  struct Particle {
    pos : vec2<f32>,
    vel : vec2<f32>,
  };
  struct SimParams {
    deltaT : f32,
    rule1Distance : f32,
    rule2Distance : f32,
    rule3Distance : f32,
    rule1Scale : f32,
    rule2Scale : f32,
    rule3Scale : f32,
    numParticles: u32,
  };
  struct Particles {
    particles : array<Particle>,
  };
  @binding(0) @group(0) var<uniform> params : SimParams;
  @binding(1) @group(0) var<storage, read> particlesA : Particles;
  @binding(2) @group(0) var<storage, read_write> particlesB : Particles;

  // https://github.com/austinEng/Project6-Vulkan-Flocking/blob/master/data/shaders/computeparticles/particle.comp
  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    var index : u32 = GlobalInvocationID.x;

    if (index >= params.numParticles) {
        return;
    }

    var vPos : vec2<f32> = particlesA.particles[index].pos;
    var vVel : vec2<f32> = particlesA.particles[index].vel;
    var cMass : vec2<f32> = vec2<f32>(0.0, 0.0);
    var cVel : vec2<f32> = vec2<f32>(0.0, 0.0);
    var colVel : vec2<f32> = vec2<f32>(0.0, 0.0);
    var cMassCount : u32 = 0u;
    var cVelCount : u32 = 0u;
    var pos : vec2<f32>;
    var vel : vec2<f32>;

    for (var i : u32 = 0u; i < arrayLength(&particlesA.particles); i = i + 1u) {
      if (i == index) {
        continue;
      }

      pos = particlesA.particles[i].pos.xy;
      vel = particlesA.particles[i].vel.xy;
      if (distance(pos, vPos) < params.rule1Distance) {
        cMass = cMass + pos;
        cMassCount = cMassCount + 1u;
      }
      if (distance(pos, vPos) < params.rule2Distance) {
        colVel = colVel - (pos - vPos);
      }
      if (distance(pos, vPos) < params.rule3Distance) {
        cVel = cVel + vel;
        cVelCount = cVelCount + 1u;
      }
    }
    if (cMassCount > 0u) {
      var temp : f32 = f32(cMassCount);
      cMass = (cMass / vec2<f32>(temp, temp)) - vPos;
    }
    if (cVelCount > 0u) {
      var temp : f32 = f32(cVelCount);
      cVel = cVel / vec2<f32>(temp, temp);
    }
    vVel = vVel + (cMass * params.rule1Scale) + (colVel * params.rule2Scale) +
        (cVel * params.rule3Scale);

    // clamp velocity for a more pleasing simulation
    vVel = normalize(vVel) * clamp(length(vVel), 0.0, 0.1);
    // kinematic update
    vPos = vPos + (vVel * params.deltaT);
    // Wrap around boundary
    if (vPos.x < -1.0) {
      vPos.x = 1.0;
    }
    if (vPos.x > 1.0) {
      vPos.x = -1.0;
    }
    if (vPos.y < -1.0) {
      vPos.y = 1.0;
    }
    if (vPos.y > 1.0) {
      vPos.y = -1.0;
    }
    // Write back
    particlesB.particles[index].pos = vPos;
    particlesB.particles[index].vel = vVel;
  }
`
