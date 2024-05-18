import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, StackPanel, TextBlock } from "babylonjs-gui";

export default class  {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Local cubemap'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 0, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.01;
    camera.upperRadiusLimit = 50;
    camera.lowerRadiusLimit = 2;
    camera.upperBetaLimit = Math.PI / 2.1;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const skybox = MeshBuilder.CreateBox('skybox', {size: 100});
    const skyMat = new StandardMaterial('skyMat');
    skyMat.backFaceCulling = false;
    skyMat.reflectionTexture = new CubeTexture(
      'https://playground.babylonjs.com/textures/TropicalSunnyDay',
      scene
    );
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMat.disableLighting = true
    skybox.material = skyMat;

    // ground
    const ground = MeshBuilder.CreateGround('ground', {width: 100, height: 100, subdivisions: 1})
    const gMat = new StandardMaterial('gMat')
    const ctex = new CubeTexture('https://playground.babylonjs.com/textures/TropicalSunnyDay', scene)
    ctex.boundingBoxSize = new Vector3(100, 100, 100)
    gMat.reflectionTexture = ctex
    gMat.disableLighting = true
    ground.material = gMat

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const panel = new StackPanel()
    panel.width = '200px'
    panel.isVertical = false
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    adt.addControl(panel)

    const cb = new Checkbox()
    cb.width = '20px'
    cb.height = '20px'
    cb.isChecked = true
    cb.color = 'green'
    cb.onIsCheckedChangedObservable.add(function(v) {
      if (!ctex.boundingBoxSize) {
        ctex.boundingBoxSize = new Vector3(100, 100, 100)
      } else {
        ctex.boundingBoxSize = null
      }
    })
    panel.addControl(cb)

    const header = new TextBlock()
    header.text = 'Local cubemap mode'
    header.width = '180px'
    header.marginLeft = '50px'
    header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    header.color = 'red'
    panel.addControl(header)

    return scene;
  }
}