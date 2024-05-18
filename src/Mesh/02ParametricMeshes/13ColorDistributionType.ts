import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorDistributionType, HemisphericLight, Scene, Vector3 } from "babylonjs";

export default class ColorDistributionType {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Color Distribution Type'
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
      colorDistributionType: GreasedLineMeshColorDistributionType.COLOR_DISTRIBUTION_TYPE_SEGMENT
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
      colorDistributionType: GreasedLineMeshColorDistributionType.COLOR_DISTRIBUTION_TYPE_LINE
    })

    // 3
    const points3 = [
      -5, -4, 0,
      5, -4, 0,
      5, -3, 0,
      5, 0, 0
    ]
    const colors3 = [
      Color3.Red(), 
      Color3.Red(), 
      Color3.Green(), 
      Color3.Blue(), 
      Color3.Blue(), 
      Color3.Yellow()
    ]
    const line3 = CreateGreasedLine('line3', {points: points3}, {
      colors: colors3,
      useColors: true,
      colorDistributionType: GreasedLineMeshColorDistributionType.COLOR_DISTRIBUTION_TYPE_LINE
    })


    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2, line3])

    return scene;
  }
}