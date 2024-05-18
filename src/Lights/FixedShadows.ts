import { ArcRotateCamera, CascadedShadowGenerator, DirectionalLight, Effect, Engine, FreeCamera, HemisphericLight, LightGizmo, Material, MeshBuilder, NodeMaterial, NoiseProceduralTexture, PBRMaterial, PointLight, Scene, SceneLoader, ShaderMaterial, ShadowDepthWrapper, ShadowGenerator, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { CustomMaterial, PBRCustomMaterial } from "babylonjs-materials";

const usePointLight = true,
      useDirectionalLight = false,
      showFloatingCube = true,
      showFloatingSphere = true,
      showFloatingShphereNodeMat = true,
      showSphereCube = false,
      usePBR: boolean = false,
      incrementTime = true

let time = 0

export default class FixedShadows {
  engine: Engine;
  scene: Scene;

  // parameters

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new FreeCamera('camera', new Vector3(0, 7, -14));
    camera.setTarget(new Vector3(0, 4, 0))
    camera.minZ = 0.1
    camera.maxZ = 40
    camera.attachControl(this.canvas, true);

    const lightHemi = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    lightHemi.intensity = 0.6

    const lightDirectional = new DirectionalLight('directional', new Vector3(8, -8, 4), scene)

    lightDirectional.intensity = usePointLight ? 0.5 : 1.0
    lightDirectional.shadowMinZ = 0
    lightDirectional.shadowMaxZ = 30
    lightDirectional.setEnabled(useDirectionalLight)

    const lightPoint = new PointLight('point', new Vector3(-1, 1, 0), scene)

    lightPoint.intensity = useDirectionalLight ? 0.3 : 0.8
    if (usePointLight) {
      const lightPointGizmo = new LightGizmo()
      lightPointGizmo.light = lightPoint
    }
    lightPoint.setEnabled(usePointLight)

    // mesh
    const room = MeshBuilder.CreateBox('room', {size: 10, sideOrientation: 1});
    room.position.y = 5
    room.receiveShadows = true

    const rMat = new StandardMaterial('rMat')
    const url = 'https://playground.babylonjs.com/textures/'
    rMat.diffuseTexture = new Texture(`${url}grass.png`)
    rMat.bumpTexture = new Texture(`${url}grassn.png`)
    room.material = rMat

    // sphere cube
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 32})
    // sphere.material = this.makeCustomMaterial(scene, 'sphere_cube')
    sphere.position = new Vector3(2, 2, 1)
    sphere.isVisible = showSphereCube

    const cube = MeshBuilder.CreateBox('cube', {size: 2})
    cube.position = new Vector3(1, 1, -1.5)
    // cube.material = sphere.material
    cube.isVisible = showSphereCube

    // floatingCube
    const boxFloating = MeshBuilder.CreateBox('box_floating', {size: 2})
    boxFloating.position = new Vector3(-3, 5, 3)
    boxFloating.material = this.makeShaderMaterialForFloatingBox(scene)
    boxFloating.isVisible = showFloatingCube

    // floatingSphere
    const spherefloating = MeshBuilder.CreateSphere('sphere_floating', {diameter: 1, segments: 16})
    spherefloating.position = new Vector3(3, 7, 3)
    spherefloating.material = this.makeCustomMaterial(scene, 'sphere_floating')
    spherefloating.material.shadowDepthWrapper = this.makeStandaloneWrapperForCustomMaterial(scene, spherefloating.material)
    spherefloating.isVisible = showFloatingSphere

    // floatingSphereNodeMat
    const sphereFloatingNodeMat = MeshBuilder.CreateSphere('sphere_floating_nodemat', {diameter: 2, segments: 32})
    sphereFloatingNodeMat.position = new Vector3(-2, 3, -2)
    NodeMaterial.ParseFromSnippetAsync('JN2BSF#29').then((nodeMaterial) => {
      const worldPosVarName = nodeMaterial.getBlockByName('worldPos')!.outputs[0].associatedVariableName

      sphereFloatingNodeMat.material = nodeMaterial
      sphereFloatingNodeMat.material.shadowDepthWrapper = new ShadowDepthWrapper(nodeMaterial, scene, {remappedVariables: ['worldPos', worldPosVarName, 'alpha', '1.']})
    })
    sphereFloatingNodeMat.isVisible = showFloatingShphereNodeMat

    // shadow
    if (useDirectionalLight) {
      const sg = new CascadedShadowGenerator(1024, lightDirectional)
      sg.lambda = 0
      sg.transparencyShadow = true
      sg.enableSoftTransparentShadow = true

      if (showSphereCube) {
        sg.addShadowCaster(sphere)
        sg.addShadowCaster(cube)
      }
      if (showFloatingCube) {
        sg.addShadowCaster(boxFloating)
      }
      if (showFloatingSphere) {
        sg.addShadowCaster(spherefloating)
      }
      if (showFloatingShphereNodeMat) {
        sg.addShadowCaster(sphereFloatingNodeMat)
      }
    }

    if (usePointLight) {
      const sg2 = new ShadowGenerator(1024, lightPoint)

      sg2.usePoissonSampling = true
      sg2.transparencyShadow = true
      sg2.enableSoftTransparentShadow = true

      if (showSphereCube) {
        sg2.addShadowCaster(sphere)
        sg2.addShadowCaster(cube)
      }
      if (showFloatingCube) {
        sg2.addShadowCaster(boxFloating)
      }
      if (showFloatingSphere) {
        sg2.addShadowCaster(spherefloating)
      }
      if (showFloatingShphereNodeMat) {
        sg2.addShadowCaster(sphereFloatingNodeMat)
      }
    }

    // move the point light
    scene.onBeforeRenderObservable.add(() => {
      if (usePointLight) {
        lightPoint.position.x = 0 + 5.0 * Math.cos(time)
        lightPoint.position.y = 3 + 2.0 * Math.cos(time)
        lightPoint.position.z = 0 + 6.0 * Math.sin(time)
      }

      if (incrementTime) {
        time += 1 / 60 / 2
      }
    })

    return scene;
  }
  
  private makeCustomMaterial(scene: Scene, suffix: string) {
    const mat = usePBR ? 
                new PBRCustomMaterial(`matpbrcustom_${suffix}`) :
                new CustomMaterial(`matcustom_${suffix}`)
    if (usePBR) mat.metallic = 0
    mat.AddUniform('noise', 'sampler2D', null)
    mat.AddUniform('dissolve', 'float', null)
    const url = 'https://playground.babylonjs.com/textures/'

    const x = new StandardMaterial('x')
    const y = new PBRMaterial('y')
    if (usePBR) {
      mat.albedoTexture = new Texture(`${url}sand.jpg`)
    } else {
      mat.diffuseTexture = new Texture(`${url}sand.jpg`)
    }

    mat.Vertex_Definitions('varying vec2 vUv;')
    mat.Vertex_MainEnd('vUV = uv;')
    mat.Fragment_Definitions('varying vec2 vUv;')

    mat.Fragment_MainBegin(`
      float n = texture2D(noise, vUv).x - dissolve;
      if (n < 0.0) { discard; }
      #define SHADOWDEPTH_SOFTTRANSPARENTSHADOW
      #define SHADOWDEPTH_FRAGMENT
    `)

    const colorName = usePBR ? 'finalColor' : 'color'

    mat.Fragment_Before_FragColor(`
      if (n < 0.10) { ${colorName}.rgb = vec3(1.0, 0.0, 0.0); }
      if (n < 0.07) { ${colorName}.rgb = vec3(0.8, 0.0, 0.0); }
      if (n < 0.05) { ${colorName}.rgb = vec3(0.6, 0.0, 0.0); }
    `)
    mat.shadowDepthWrapper = new ShadowDepthWrapper(mat, scene, {remappedVariables: ['alpha', '1']})

    let dis = 0.0
    let amount = -0.008

    const tex = new NoiseProceduralTexture('perlin', 1024)
    tex.refreshRate = 0
    tex.animationSpeedFactor = 1
    tex.persistence = .7
    tex.brightness = .5
    tex.octaves = 14

    mat.noise = tex
    mat.dissolve = dis

    scene.onBeforeRenderObservable.add(() => {
      dis += amount;
      if(dis <= -0.2 || dis >= 1.2){
          amount = -amount;
      }
      mat.dissolve = dis;
    });

    mat.onBindObservable.add((m) => { 
        mat.getEffect().setFloat('dissolve', dis);
        mat.getEffect().setTexture('noise', tex);
    });

    return mat;
  }

  private makeShaderMaterialForFloatingBox(scene: Scene) {
    BABYLON.Effect.ShadersStore["floatingBoxVertexShader"] = `
      precision highp float;

        attribute vec3 position;
          attribute vec3 normal;
        attribute vec2 uv;

        #include<__decl__sceneVertex>
        #include<__decl__meshVertex>

          uniform float time;

          varying vec2 vUV;

        void main(void) {
              vUV = uv;

              vec4 p = vec4(position, 1.0);

              float m = (p.x + p.z + p.y) / 3.;

              m = m * p.y;

              p.x = p.x + m * sin(2.0 * time);
              p.y = p.y + m * sin(-3.0 * time);
              p.z = p.z + m * cos(5.0 * time);

              p = world * p;

              vec3 normalW = normalize(mat3(world) * normal);

              #define SHADOWDEPTH_NORMALBIAS

            gl_Position = projection * view * p;
        }`;

      Effect.ShadersStore["floatingBoxFragmentShader"] = `
        precision highp float;

          varying vec2 vUV;
          uniform sampler2D textureSampler;

        void main(void) {
              gl_FragColor = texture2D(textureSampler, vUV);
        }`;

      const shaderMaterial = new ShaderMaterial("shader", scene, {
          vertex: "floatingBox",
          fragment: "floatingBox",
        },
          {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "view", "projection", "time"],
              samplers: ["textureSampler"],
              uniformBuffers: ["Mesh", "Scene"]
          });

      const url = 'https://playground.babylonjs.com/textures/'
      shaderMaterial.setTexture("textureSampler", new Texture(`${url}crate.png`, scene));

      shaderMaterial.shadowDepthWrapper = new ShadowDepthWrapper(shaderMaterial, scene, {
          remappedVariables: ["worldPos", "p", "vNormalW", "normalW", "alpha", "1."]
      });

      shaderMaterial.onBindObservable.add((m) => { 
          shaderMaterial.getEffect().setFloat("time", time);
      });

      return shaderMaterial;
  }

  private makeStandaloneWrapperForCustomMaterial(scene: Scene, mainMaterial: Material) {
    Effect.ShadersStore["shaderdepthVertexShader"] = BABYLON.Effect.ShadersStore["shadowMapVertexShader"]
          .replace(/#include<shadowMapVertexExtraDeclaration>/g, "")
          .replace(/#include<shadowMapVertexNormalBias>/g, "#define SHADOWDEPTH_NORMALBIAS")
          .replace(/#include<shadowMapVertexMetric>/g, "")
          .replace(/#include<shadowMapFragmentExtraDeclaration>/g, "")
          .replace(/#include<shadowMapFragment>/g, "")
          .replace(/void main\(void\)\s*?\{/g, "attribute vec2 uv; varying vec2 vUv; void main(void) { vUv=uv;\r\n");

    Effect.ShadersStore["shaderdepthFragmentShader"] = `
      precision highp float;

        uniform float dissolve;
        uniform sampler2D noise;

        varying vec2 vUv;

      void main(void) {
            float alpha = 1.;
            float n = texture2D( noise, vUv ).x - dissolve;
            if (n < 0.0) { discard; }
      }
    `;

    const shaderMaterial = new ShaderMaterial("shaderdepth", scene, {
        vertex: "shaderdepth",
        fragment: "shaderdepth",
    },
    {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "viewProjection", "dissolve"],
            samplers: ["noise"],
            uniformBuffers: ["Mesh", "Scene"],
            defines: ["#define NORMAL"]
    });

    const shadowDepthWrapper = new ShadowDepthWrapper(shaderMaterial, scene, {
        standalone: true
    });

    shaderMaterial.onBindObservable.add((m) => { 
        shaderMaterial.getEffect().setFloat('dissolve', mainMaterial.dissolve);
        shaderMaterial.getEffect().setTexture('noise', mainMaterial.noise);
    });

    return shadowDepthWrapper;
  }
}

