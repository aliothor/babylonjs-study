import { ArcRotateCamera, Color3, CreateGreasedLine, Debug, Engine, Scene, Vector3 } from "babylonjs";

export default class AddingDifferentlyColoredLinesToAnInstance {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Adding Differently Colored Lines To An Instance'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2.8, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // const colors: Color3[] = [Color3.Green(), Color3.Magenta()]
    const colors: Color3[] = []
    const points1 = [
      0, -1, 0,
      0, 0, 0,
      0, 1, 0,
      0, 2, 0
    ]
    const line = CreateGreasedLine('line', {
      points: points1
    }, {
      // color: Color3.Red(),
      useColors: true,
      colors
    })

    const points2 = [
      4, -1, 0,
      4, 0, 0,
      4, 1, 0,
      4, 2, 0
    ]
    CreateGreasedLine('', {
      points: points2,
      instance: line
    }, {
      color: Color3.Gray(),
      useColors: true,
      colors
    })

    const points3 = [
      [
        0, -1, -3,
        0, 0, -3,
        0, 1, -3,
        0, 2, -3
      ],
      [
        0, -1, -4,
        0, 0, -4,
        0, 1, -4,
        0, 2, -4
      ]
    ]
    CreateGreasedLine('', {
      points: points3,
      instance: line
    }, {
      color: Color3.Blue(),
      useColors: true,
      colors
    })

    new Debug.AxesViewer()
    
    return scene;
  }
}