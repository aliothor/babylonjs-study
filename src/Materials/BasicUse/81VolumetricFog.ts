import { AbstractMesh, CascadedShadowGenerator, Color3, CubeTexture, DirectionalLight, Engine, Material, MaterialDefines, MaterialPluginBase, Matrix, MeshBuilder, Nullable, PBRBaseMaterial, Quaternion, RegisterMaterialPlugin, Scene, SceneLoader, ShadowGenerator, StandardMaterial, SubMesh, Texture, UniformBuffer, Vector3 } from "babylonjs";
import 'babylonjs-loaders'
import dat from "dat.gui";

export default class VolumetricFog {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Volumetric Fog'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    scene.createDefaultCamera(false)
    scene.activeCamera?.attachControl(this.canvas, false)
    // const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    // camera.attachControl(this.canvas, true);

    RegisterMaterialPlugin('VolumetricFog', material => {
      material.volumetricFog = new VolumetricFogPluginMaterial(material)
      return material.volumetricFog
    })

    // OBJFileLoader.OPTIMIZE_WITH_UV = true
    // OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = false
    // OBJFileLoader.INVERT_TEXTURE_Y = false

    const sky = this.addSkybox('https://playground.babylonjs.com/textures/skybox4', 100, scene)

    SceneLoader.Append('https://assets.babylonjs.com/meshes/PowerPlant/', 'powerplant.obj', scene, (s) => {
      // s.activeCameras?.pop()
      // s.createDefaultCamera(false)
      // s.activeCamera?.attachControl(this.canvas, false)

      s.ambientColor = new Color3(1, 1, 1)
      const light = new DirectionalLight('light', new Vector3(-1, -1, -1), s)
      light.intensity = 1
      light.shadowMinZ = -90 * 2
      light.shadowMaxZ = 130 * 2

      s.activeCamera!.minZ = 0.25
      s.activeCamera!.maxZ = 250
      s.activeCamera!.position.set(102, 13, 5)
      s.activeCamera!.target = new Vector3(0, 0, 5)
      s.activeCamera!.fov = Math.PI / 4 * 0.75
      s.activeCamera!.angularSensibility = 2000
      s.activeCamera!.speed = 3

      sky.position = s.activeCamera?.position

      // shadow
      const csg = new CascadedShadowGenerator(1024, light)
      csg.usePercentageCloserFiltering = true
      csg.filteringQuality = ShadowGenerator.QUALITY_MEDIUM
      csg.bias = 0.003
      csg.autoCalcDepthBounds = false

      const gui = this.makeGUI(csg, scene)

      s.meshes.forEach(m => {
        if (m.material && m.name != 'skybox') {
          m.material.diffuseColor.set(1, 1, 1)
          m.material.specularColor.set(0, 0, 0)
          m.material.ambientColor.set(0.3, 0.3, 0.3)
          m.material.ambientTexture = null
          m.material.pluginManager.getPlugin('VolumetricFog').isEnabled = true
          if (!m.material.diffuseTexture) {
            m.material.ambientColor.set(0, 0, 0)
          }
          m.material.backFaceCulling = false
          csg.addShadowCaster(m)
          m.receiveShadows = true
        }
      })

      s.onBeforeRenderObservable.add(() => {
        if (gui.global_animateLight) {
          this.rotateLight(light.direction)
        }
      })
    })

    return scene;
  }

  addSkybox(url: string, size: number, scene: Scene) {
    const skybox = MeshBuilder.CreateBox('skybox', {size: size}, scene)
    const skyMat = new StandardMaterial('skyMat', scene)

    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture(url, scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skyMat.disableLighting = true
    skyMat.disableDepthWrite = true

    skybox.material = skyMat
    skybox.alwaysSelectAsActiveMesh = true

    return skybox
  }

  makeGUI(csg: CascadedShadowGenerator, scene: Scene) {
    const gui = new dat.GUI()

    const options = {
      'global_animateLight': false,
      'global_fogradius': 60,
      'global_fogdensity': 4.5,
      
      'shadowmap_debug': csg.debug,
      'shadowmap_lambda': csg.lambda,
      'shadowmap_size': csg.mapSize,
      'shadowmap_bias': csg.bias,

      'shadow_pcffiltering': csg.filteringQuality,
      'shadow_autocalcdepthbounds': csg.autoCalcDepthBounds,
    }
    gui.domElement.style.marginTop = '50px'

    // global
    const global = gui.addFolder('Global')
    global.add(options, 'global_animateLight')
      .name('Animate light')
      .onChange((v) => void(0))
    global.add(options, 'global_fogradius', 1, 150, 1)
      .name('Fog radius')
      .onChange((v) => {
        const d = parseFloat(v)
        scene.meshes.forEach((m) => {
          if (m.material && m.material.volumetricFog) {
            m.material.volumetricFog.radius = d
          }
        })
      })
    global.add(options, 'global_fogdensity', 0.1, 20, 0.01)
      .name('Fog density')
      .onChange((v) => {
        const d = parseFloat(v)
        scene.meshes.forEach((m) => {
          if (m.material && m.material.volumetricFog) {
            m.material.volumetricFog.density = d
          }
        })
      })
    global.open()

    // shadow map
    const sm = gui.addFolder('Shadow map')
    sm.add(options, 'shadowmap_debug')
      .name('Debug cascades')
      .onChange(v => {
        csg.debug = v
      })
    sm.add(options, 'shadowmap_lambda', 0, 1, 0.01)
      .name('Lambda')
      .onChange(v => {
        csg.lambda = parseFloat(v)
      })
    sm.add(options, 'shadowmap_size', [512, 1024, 2048, 4096])
      .name('Size')
      .onChange(v => {
        csg.mapSize = parseInt(v)
      })
    sm.add(options, 'shadowmap_bias', 0, 0.1, 0.001)
      .name('Bias')
      .onChange(v => {
        csg.bias = parseFloat(v)
      })
    sm.add(options, 'shadow_pcffiltering', [0, 1, 2])
      .name('PCF filtering')
      .onChange(v => {
        csg.filteringQuality = parseInt(v)
      })
    sm.add(options, 'shadow_autocalcdepthbounds')
      .name('Auto calc depth bounds')
      .onChange(v => {
        csg.autoCalcDepthBounds = v
      })
    sm.open()

    return options
  }

  XMScalaModAngle(angle: number) {
    angle += Math.PI
    let fTemp = Math.abs(angle)
    const PIPI = Math.PI * 2
    fTemp -= (PIPI * Math.floor(fTemp / PIPI))
    fTemp -= Math.PI
    if (angle < 0) {
      fTemp = -fTemp
    }
    return fTemp
  }

  matrix = new Matrix()
  rotation = new Quaternion()

  rotateLight(sunDir: Vector3) {
    const deltaTime = this.engine.getDeltaTime() / 1000
    let rotY = this.XMScalaModAngle(deltaTime * 0.25)
    Quaternion.RotationAxisToRef(Vector3.UpReadOnly, rotY, this.rotation)
    Matrix.FromQuaternionToRef(this.rotation, this.matrix)
    Vector3.TransformCoordinatesToRef(sunDir, this.matrix, sunDir)
  }

}

class VolumetricFogPluginMaterial extends MaterialPluginBase {
  center = new Vector3(0, 0, 0)
  radius = 60
  color = new Color3(1, 1, 1)
  density = 4.5
  private _isEnabled = false
  private _varColorName: string

  get isEnabled() {
    return this._isEnabled
  }
  set isEnabled(enabled: boolean) {
    if (this._isEnabled == enabled) return
    this._isEnabled = enabled
    this.markAllDefinesAsDirty()
    this._enable(this.isEnabled)
  }

  constructor(material: Material) {
    super(material, 'VolumetricFog', 200, { 'VOLUMETRIC_FOG': false })
    this._varColorName = material instanceof PBRBaseMaterial ? 'finalColor' : 'color'
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
    defines['VOLUMETRIC_FOG'] = this._isEnabled
  }

  getUniforms(): { ubo?: { name: string; size: number; type: string; }[] | undefined; vertex?: string | undefined; fragment?: string | undefined; } {
    return {
      ubo: [
        { name: 'volFogCenter', size: 3, type: 'vec3' },
        { name: 'volFogRadius', size: 1, type: 'float' },
        { name: 'volFogColor', size: 3, type: 'vec3' },
        { name: 'volFogDensity', size: 1, type: 'float' },
      ],
      fragment:
        `#ifdef VOLUMETRIC_FOG
          uniform vec3 volFogCenter;
          uniform float volFogRadius;
          uniform vec3 volFogColor;
          uniform float volFogDensity;
        #endif`
    }
  }

  bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh): void {
    if (this._isEnabled) {
      uniformBuffer.updateVector3('volFogCenter', this.center)
      uniformBuffer.updateFloat('volFogRadius', this.radius)
      uniformBuffer.updateColor3('volFogColor', this.color)
      uniformBuffer.updateFloat('volFogDensity', this.density)
    }
  }

  getClassName(): string {
    return 'VolumetricFogPluginMaterial'
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
    return shaderType == 'vertex' ? null : {
      'CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR': `
        #ifdef VOLUMETRIC_FOG
          float volFogRadius2 = volFogRadius * volFogRadius;
          float distCamToPos = distance(vPositionW.xyz, vEyePosition.xyz);
          vec3 dir = normalize(vPositionW.xyz - vEyePosition.xyz);
          vec3 L = volFogCenter - vEyePosition.xyz;
          float tca = dot(L, dir);
          float d2 = dot(L, L) - tca * tca;
          if (d2 < volFogRadius2) {
            float thc = sqrt(volFogRadius2 - d2);
            float t0 = tca - thc;
            float t1 = tca + thc;
            float dist = 0.0;
            if (t0 < 0.0 && t1 > 0.0) {
              dist = min(distCamToPos, t1);
            } else if (t0 > 0.0 && t1 > 0.0 && t0 < distCamToPos) {
              dist = min(t1, distCamToPos) - t0;
            }
            float distToCenter = length(cross(volFogCenter - vEyePosition.xyz, dir));
            float fr = distToCenter < volFogRadius ? smoothstep(0.0, 1.0, cos(distToCenter/volFogRadius*3.141592/2.0)) : 0.0;
            float e = dist/(volFogRadius*2.0);
            e = 1.0 - exp(-e * volFogDensity);
            ${this._varColorName} = mix(${this._varColorName}, vec4(volFogColor, ${this._varColorName}.a), clamp(e*fr, 0.0, 1.0));
          }
        #endif
      `
    }
  }

}

