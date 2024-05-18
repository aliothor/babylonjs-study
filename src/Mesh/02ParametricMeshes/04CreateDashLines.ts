import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CreateDashLines {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Dash Lines'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const myPoints = [
      new Vector3(-2, -1, 0),
      new Vector3(0, 1, 0),
      new Vector3(2, -1, 0)
    ]
    myPoints.push(myPoints[0])

    let lines = MeshBuilder.CreateDashedLines('lines', {
      points: myPoints,
      updatable: true,
      dashSize: 2000,
      gapSize: 1000,
      dashNb: 80
    })
    lines.color = Color3.Red()

    myPoints[1].y += 1
    lines = MeshBuilder.CreateDashedLines('lines', {
      points: myPoints,
      instance: lines
    })

    return scene;
  }
}