import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CreateMultiColoredLines {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Multi Colored Lines'
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

    const myColors = [
      new Color4(1, 0, 0, 1),
      new Color4(0, 1, 0, 1),
      new Color4(0, 0, 1, 1),
      new Color4(1, 1, 0, 1)
    ]

    let lines = MeshBuilder.CreateLines('lines', {
      points: myPoints,
      colors: myColors
    })

    return scene;
  }
}