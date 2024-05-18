import { ArcRotateCamera, Color3, Color4, Debug, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class PositionSphereUsingTransformCoordinates {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Position a Sphere Using Transform Coordinates'
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

    const boxW = MeshBuilder.CreateBox('boxW', {faceColors})
    boxW.position = new Vector3(1, 2, 3)
    boxW.rotation.x = -Math.PI / 4
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.25})

    const localPos = new Vector3(0, 0.5, 0)
    localPos.addInPlace(new Vector3(1, 1, 1))
    const matrix = boxW.computeWorldMatrix(true)
    const globalPos = Vector3.TransformCoordinates(localPos, matrix)
    sphere.position = globalPos

    new Debug.AxesViewer()

    return scene;
  }
}