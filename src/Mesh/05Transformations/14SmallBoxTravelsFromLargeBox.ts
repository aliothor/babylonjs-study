import { ArcRotateCamera, AxesViewer, Axis, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Space, Vector3 } from "babylonjs";

export default class SmallBoxTravelsFromLargeBox {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Small Box Travels From Large Box'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {faceColors})
    const small = MeshBuilder.CreateBox('small', {width: 0.25, depth: 0.25, height: 0.75, faceColors})

    new AxesViewer()
    const localOrigin = new AxesViewer()
    localOrigin.xAxis.parent = box
    localOrigin.yAxis.parent = box
    localOrigin.zAxis.parent = box

    let matrix
    let y = 0
    let localPos
    scene.onAfterRenderObservable.add(() => {
      box.rotate(Axis.Y, Math.PI / 150, Space.LOCAL)
      box.rotate(Axis.X, Math.PI / 200, Space.LOCAL)
      box.translate(new Vector3(-1, -1, -1).normalize(), 0.001, Space.WORLD)
      small.rotationQuaternion = box.rotationQuaternion
      // small.rotate(Axis.Y, Math.PI / 150, Space.LOCAL)
      // small.rotate(Axis.X, Math.PI / 200, Space.LOCAL)
      matrix = box.getWorldMatrix()
      y += 0.001
      localPos = new Vector3(0, y, 0)
      small.position = Vector3.TransformCoordinates(localPos, matrix)
    })

    return scene;
  }
}