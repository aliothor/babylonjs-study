import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, StackPanel } from "babylonjs-gui";
import 'babylonjs-loaders'

export default class SpecularAliasingInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Specular Aliasing In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    this.engine.enableOfflineSupport = false
    this.engine.setHardwareScalingLevel(0.5)
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 10
    camera.upperRadiusLimit = 30

    this.engine.displayLoadingUI()

    SceneLoader.ImportMesh('', 'https://models.babylonjs.com/', 'shark.glb', scene, (meshes) => {
      const helper = scene.createDefaultEnvironment({
        createGround: false
      })

      // UI
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
      adt.renderScale = 0.5
      const panel = new StackPanel()
      panel.width = '150px'
      panel.fontSize = '14px'
      panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
      panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
      adt.addControl(panel)

      const check = new Checkbox('')
      check.width = '20px'
      check.height = '20px'
      check.color = '#0088FF'
      check.isChecked = true
      check.onIsCheckedChangedObservable.add((v) => {
        for (let i = 0; i < scene.materials.length; i++) {
          scene.materials[i].enableSpecularAntiAliasing = v
        }
      })

      const header = Control.AddHeader(check, 'Toggle Specular AA', '180px', {isHorizontal: true, controlFirst: true})
      header.height = '30px'
      header.color = 'white'
      header.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
      panel.addControl(header)

      scene.animationGroups[0].start(true)

      this.engine.hideLoadingUI()
    })

    return scene;
  }
}