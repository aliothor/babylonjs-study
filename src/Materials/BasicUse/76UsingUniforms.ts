import { AbstractMesh, Color3, CubeTexture, Engine, Material, MaterialDefines, MaterialPluginBase, Nullable, PBRBaseMaterial, RegisterMaterialPlugin, Scene, SceneLoader, SubMesh, UniformBuffer, UniversalCamera, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class UsingUniforms {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Uniforms'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new UniversalCamera('camera', new Vector3(0, 0, 0));

    const hdrTex = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)
    const skybox = scene.createDefaultSkybox(hdrTex, true)

    RegisterMaterialPlugin('Colorify', (material) => {
      material.colorify = new ColorifyPluginMaterial(material)
      return material.colorify
    })

    SceneLoader.Append('https://playground.babylonjs.com/scenes/BoomBox/', 'BoomBox.gltf', scene, function(s) {
      scene.createDefaultCameraOrLight(true, true, true)

      scene.activeCamera!.alpha += Math.PI 

      s.meshes.forEach((m) => {
        if (m.material && m.material.name != 'skyBox') {
          m.material.pluginManager!.getPlugin('Colorify').isEnabled = true
        }
      })
    })

    return scene;
  }
}

class ColorifyPluginMaterial extends MaterialPluginBase {
  color = new Color3(1, 0, 0)
  _isEnabled = false
  private _varColorName: string

  get isEnabled() {
    return this._isEnabled
  }
  set isEnabled(enabled: boolean) {
    if (this._isEnabled == enabled) {
      return
    }
    this._isEnabled = enabled
    this.markAllDefinesAsDirty()
    this._enable(this._isEnabled)
  }

  constructor(material: Material) {
    super(material, 'Colorify', 200, {'COLORIFY': false})
  
    this._varColorName = material instanceof PBRBaseMaterial ? 'finalColor' : 'color'
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
      defines['COLORIFY'] = this._isEnabled
  }

  getClassName(): string {
      return 'ColorifyPluginMaterial'
  }

  getUniforms(): { ubo?: { name: string; size: number; type: string; }[] | undefined; vertex?: string | undefined; fragment?: string | undefined; } {
    return {
      ubo: [
        { name: 'myColor', size: 3, type: 'vec3' }
      ],
      fragment: `
        #ifdef COLORIFY
          uniform vec3 myColor;
        #endif
      `
    }
  }

  bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh): void {
    if (this._isEnabled) {
      uniformBuffer.updateColor3('myColor', this.color)
    }
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
    return shaderType == 'vertex' ? null : {
      'CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR': `
        #ifdef COLORIFY
          ${this._varColorName}.rgb *= myColor;
        #endif
      `,
      '!diffuseBase\\+=info\\.diffuse\\*shadow;': `
        diffuseBase += info.diffuse * shadow;
        diffuseBase += vec3(0, 0.2, 0.8);
      `
    }
  }
}