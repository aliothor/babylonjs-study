import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CreateLineSystem {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Line System'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const myLines = [
      [
        new Vector3(0, 0, 10),
        new Vector3(10, 0, 10)
      ],
      [
        new Vector3(10, 0, 0),
        new Vector3(10, 10, 0),
        new Vector3(0, 10, 0)
      ]
    ]

    const myColors = [
      [
        new Color4(0, 1, 1, 1),
        new Color4(1, 0, 0, 1)
      ],
      [
        new Color4(0, 1, 0, 1),
        new Color4(0, 0, 1, 1),
        new Color4(1, 1, 0, 1)
      ]
    ]

    const lines = MeshBuilder.CreateLineSystem('lines', {
      lines: myLines,
      colors: myColors
    }, scene)
    // lines.color = Color3.Green()

    return scene;
  }
}