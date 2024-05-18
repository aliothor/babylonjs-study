import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Material, MaterialPluginBase, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";
import { MaterialDefines, AbstractMesh, Nullable } from "babylonjs/index";

export default class UsingGrain {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using for Grain'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = Color4.FromColor3(Color3.Black())

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(0, 5, 0), scene);
    light.diffuse = new Color3(1, 1, 1)
    light.intensity = 0.5
    light.specular = new Color3(0, 0, 0)
    light.range = 200

    // ground
    const mirror = MeshBuilder.CreateBox('mirror', {size: 300, height: 1})
    mirror.position = new Vector3(0, -9, 0)
    const mMat = new StandardMaterial('mirrorMat')
    mMat.diffuseColor = new Color3(0.5, 0.5, 0.5)
    mMat.specularColor = new Color3(1, 1, 1)
    mirror.material = mMat

    const plugin = new GrainPluginMaterial(mirror.material)
    setInterval(() => {
      plugin.isEnabled = !plugin.isEnabled
    }, 1000)

    return scene;
  }

}

class GrainPluginMaterial extends MaterialPluginBase {
  private _isEnabled = false

  get isEnabled() {
    return this._isEnabled
  }
  set isEnabled(enabled: boolean) {
    if (this._isEnabled == enabled) return
    this._isEnabled = enabled
    this.markAllDefinesAsDirty()
    this._enable(this._isEnabled)
  }

  constructor(material: Material) {
    super(material, 'Grain', 200, {'GRAINPLUGIN': false})
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
    defines['GRAINPLUGIN'] = this._isEnabled
  }

  getClassName(): string {
    return 'GrainPluginMaterial'
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
    return shaderType == 'vertex' ? null : {
      'CUSTOM_FRAGMENT_MAIN_END': `
        #ifdef GRAINPLUGIN
          gl_FragColor.rgb += dither(vPositionW.xy, 0.5);
          gl_FragColor.rgb = max(gl_FragColor.rgb, 0.0);
        #endif
      `
    }
  }

}