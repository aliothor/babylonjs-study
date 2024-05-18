import { AbstractMesh, Engine, Material, MaterialDefines, MaterialPluginBase, Nullable, RegisterMaterialPlugin, Scene, SceneLoader, UniversalCamera, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class BasicMaterialPlugin {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Basic Material Plugin'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new UniversalCamera('camera', new Vector3(0, 0, 0));

    RegisterMaterialPlugin('BlackAndWhite', (material) => {
      material.blackandwhite = new BlackAndWhitePluginMaterial(material)
      return material.blackandwhite
    })

    SceneLoader.Append('https://playground.babylonjs.com/scenes/BoomBox/', 'BoomBox.gltf', scene, function(s) {
      scene.createDefaultCameraOrLight(true, true, true)

      scene.activeCamera!.alpha += Math.PI 
    })

    return scene;
  }
}

class BlackAndWhitePluginMaterial extends MaterialPluginBase {
  constructor(material: Material) {
    super(material, 'BlackAndWhite', 200, {'BLACKANDWHITE': false})
    this._enable(true)
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
      defines['BLACKANDWHITE'] = true
  }

  getClassName(): string {
      return 'BlackAndWhitePluginMaterial'
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
      if (shaderType == 'fragment') {
        return {
          'CUSTOM_FRAGMENT_MAIN_END': `
            float luma = gl_FragColor.r * 0.299 + gl_FragColor.g * 0.587 + gl_FragColor.b * 0.114;
            gl_FragColor = vec4(luma, luma, luma, 1.0);
          `
        }
      }
      return null
  }
}