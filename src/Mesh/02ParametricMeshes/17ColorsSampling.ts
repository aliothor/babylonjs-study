import { ArcRotateCamera, Color3, Constants, CreateGreasedLine, Engine, HemisphericLight, Scene, Vector3 } from "babylonjs";

export default class ColorsSampling {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Colors Sampling'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // 1
    const points1 = [
      -5, 6, 0,
      5, 6, 0,
      5, 7, 0,
      5, 12, 0
    ]
    const colors1 = [Color3.Red(), Color3.Green(), Color3.Blue()]
    const line1 = CreateGreasedLine('line1', {points: points1}, {
      colors: colors1,
      useColors: true,
      colorsSampling: Constants.TEXTURE_NEAREST_NEAREST
    })

    // 2
    const points2 = [
      -5, 1, 0,
      5, 1, 0,
      5, 2, 0,
      5, 5, 0
    ]
    const colors2 = [Color3.Red(), Color3.Green(), Color3.Blue(), Color3.Yellow()]
    const line2 = CreateGreasedLine('line2', {points: points2}, {
      colors: colors2,
      useColors: true,
      colorsSampling: Constants.TEXTURE_LINEAR_LINEAR
    })

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2])

    return scene;
  }
}