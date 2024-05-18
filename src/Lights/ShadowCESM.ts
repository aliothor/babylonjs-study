import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, StackPanel } from "babylonjs-gui";
import "babylonjs-loaders"

export default class ShadowCESM {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 0, 0, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.setPosition(new Vector3(80, 80, 120))

    const light = new DirectionalLight('light', new Vector3(-1, -2, 1), scene);
    light.position = new Vector3(20, 40, -20)

    const shadowGen = new ShadowGenerator(1024, light)

    SceneLoader.ImportMesh(
      '',
      'https://playground.babylonjs.com/scenes/',
      'skull.babylon',
      scene,
      (newMeshes) => {
        let skull = newMeshes[0]
        camera.target = skull.position

        shadowGen.addShadowCaster(skull)
        shadowGen.useBlurCloseExponentialShadowMap = true
        shadowGen.forceBackFacesOnly = true
        shadowGen.blurKernel = 32
        shadowGen.useKernelBlur = true

        light.shadowMinZ = 10
        light.shadowMaxZ = 70

        skull.receiveShadows = true
      }
    )

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')

    const panel = new StackPanel()
    panel.width = '120px'
    panel.isVertical = true
    panel.paddingRight = '20px'
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    adt.addControl(panel)

    const checkbox = new Checkbox()
    checkbox.width = '20px'
    checkbox.height = '20px'
    checkbox.isChecked = true
    checkbox.color = 'green'
    checkbox.onIsCheckedChangedObservable.add((value) => {
      scene.shadowsEnabled = !scene.shadowsEnabled
    })

    const header = Control.AddHeader(checkbox, 'shadows', '180px', {isHorizontal: true, controlFirst: true})
    header.height = '30px'
    header.color = 'white'
    header.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    panel.addControl(header)

    return scene;
  }
}