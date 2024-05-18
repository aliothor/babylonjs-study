import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshWidthDistribution, HemisphericLight, Scene, Vector3 } from "babylonjs";

export default class GreasedLineWidths {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Widths'
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

    const points1 = []
    const widths = [1, 2, 4, 8]
    for (let x = 0; x < 10; x += 0.25) {
      points1.push(new Vector3(x, Math.cos(x / 2) - 2, 0))
    }
    const line1 = CreateGreasedLine('line1', {points: points1, widths}, {color: Color3.Red()})

    const line2 = CreateGreasedLine('line2', {
      points: points1.map(p => new Vector3(p.x, p.y - 2, p.z)),
      widths,
      widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_END
    }, {color: Color3.Green()})

    const line3 = CreateGreasedLine('line3', {
      points: points1.map(p => new Vector3(p.x, p.y - 4, p.z)),
      widths,
      widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START_END
    }, {color: Color3.Yellow()})

    const line4 = CreateGreasedLine('line4', {
      points: points1.map(p => new Vector3(p.x, p.y - 6, p.z)),
      widths,
      widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_EVEN
    }, {color: Color3.Magenta()})

    const line5 = CreateGreasedLine('line5', {
      points: points1.map(p => new Vector3(p.x, p.y - 8, p.z)),
      widths,
      widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT
    }, {color: Color3.Purple()})

    const line6 = CreateGreasedLine('line6', {
      points: points1.map(p => new Vector3(p.x, p.y - 10, p.z)),
      widths: [1, 1, 8, 1],
      widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT
    }, {color: Color3.Gray()})


    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2, line3, line4, line5, line6])

    return scene;
  }
}