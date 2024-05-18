import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, SolidParticle, SolidParticleSystem, Vector3 } from "babylonjs";

export default class CombiningPickingInfoFacetData {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Combining PickingInfo and FacetData'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const nb = 20000
    const fact = 100

    // position funciton
    const rand = Math.random
    function myPosFun(particle: SolidParticle) {
      particle.position = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).scale(fact)
      particle.rotation = new Vector3(rand() * 3.15, rand() * 3.15, rand() * 1.5)
      particle.color = new Color4(particle.position.x / fact + 0.5, particle.position.y / fact + 0.5, particle.position.z / fact + 0.5, 1)
    }

    // model 
    const model = MeshBuilder.CreatePolyhedron('m')

    // SPS 
    const sps = new SolidParticleSystem('sps', scene, {isPickable: true})
    sps.addShape(model, nb)
    const mesh = sps.buildMesh()
    mesh.updateFacetData()

    model.dispose()
    // sps init
    sps.initParticles = function() {
      for (let i = 0; i < sps.nbParticles; i++) {
        myPosFun(sps.particles[i])
      }
    }
    sps.initParticles()
    sps.setParticles()
    sps.refreshVisibleSize()
    sps.computeParticleTexture = false

    // sps animation
    scene.registerBeforeRender(() => {
      sps.mesh.rotation.y += 0.001
    })

    const ball = MeshBuilder.CreateSphere('ball', {diameter: 10})
    scene.onPointerDown = function(evt, pickInfo) {
      const faceId = pickInfo.faceId
      if (faceId == -1) return
      const idx = sps.pickedParticles[faceId].idx
      const p = sps.particles[idx]
      p.color = new Color4(1, 0, 0, 1)
      p.scaling = Vector3.One().scale(5)
      sps.setParticles()
      mesh.getFacetPositionToRef(faceId, ball.position)
    }

    return scene;
  }
}