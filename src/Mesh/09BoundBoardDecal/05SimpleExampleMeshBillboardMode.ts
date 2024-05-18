import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";

export default class SimpleExampleMeshBillboardMode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simple Example of Mesh Billboard Mode'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.useAutoRotationBehavior = true
    camera.autoRotationBehavior!.idleRotationSpeed = 1

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {faceColors});
    box.position.y = 1
    box.billboardMode = 0

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})

    new AxesViewer()

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const btn = Button.CreateSimpleButton('btn', 'BillBoardMode On')
    btn.width = '300px'
    btn.height = '40px'
    btn.color = 'white'
    btn.background = 'green'
    btn.cornerRadius = 10
    btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    btn.onPointerUpObservable.add(function() {
      if (box.billboardMode == 0) {
        box.billboardMode = 7
        btn.textBlock!.text = 'BillBoardMode Off'
      } else {
        box.billboardMode = 0
        btn.textBlock!.text = 'BillBoardMode On'
      }
    })
    adt.addControl(btn)

    return scene;
  }
}