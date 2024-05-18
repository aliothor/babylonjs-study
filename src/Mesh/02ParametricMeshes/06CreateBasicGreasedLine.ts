import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorDistributionType, GreasedLineTools, HemisphericLight, Scene, Vector3 } from "babylonjs";

export default class CreateBasicGreasedLine {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Basic GreasedLine'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.setTarget(new Vector3(0, 7, 0))

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // simple line
    const points1 = [
      -1, 10, 0,
      1, 10, 0
    ]
    const line1 = CreateGreasedLine('line1', {points: points1})

    // two lines with color
    const points2 = [
      [
        -1, 9, 0,
        1, 9, 0
      ],
      [
        2, 9, 0,
        4, 9, 0
      ]
    ]
    const line2 = CreateGreasedLine('line2', {points: points2}, {color: Color3.Red()})

    // the colors are divided between segments
    const points3 = [
      2, 8, 0,
      3, 8, 0,
      4, 7, 0
    ]
    const colors3 = [Color3.Teal(), Color3.Blue()]
    const line3 = CreateGreasedLine('line3', {points: points3}, {width: 0.2, colors: colors3, useColors: true}) 

    // the colors are divided along the line
    const points4 = [
      -1, 8, 0,
      0, 8, 0,
      1, 7, 0
    ]
    const colors4 = [Color3.Green(), Color3.Yellow(), Color3.Purple()]
    const line4 = CreateGreasedLine('line4', {points: points4}, {width: 0.2, colors: colors4, useColors: true, colorDistributionType: GreasedLineMeshColorDistributionType.COLOR_DISTRIBUTION_TYPE_LINE})

    // two lines with different colors
    const colors5 = [Color3.Red(), Color3.BlackReadOnly, Color3.Blue()]
    const points5 = [
      [
        -1, 6, 0,
        1, 6, 0
      ],
      [
        2, 6, 0,
        4, 6, 0
      ]
    ]
    const line5 = CreateGreasedLine('line5', {points: points5}, {colors: colors5, useColors: true})

    // line widths
    const points6 = GreasedLineTools.SegmentizeLineBySegmentCount(GreasedLineTools.ToVector3Array(
      [
        -4, 5, 0,
        4, 5, 0
      ]
    ), 5)
    const widths6 = [1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1]
    const line6 = CreateGreasedLine('line6', {points: points6, widths: widths6}, {width: 0.2})

    // line widths
    const points7 = GreasedLineTools.SegmentizeLineBySegmentCount(GreasedLineTools.ToVector3Array(
      [
        -4, 4, 0,
        4, 4, 0
      ]
    ), 5)
    const widths7 = [1, 1, 2, 1, 3, 1, 3, 1, 2, 1, 1, 1]
    const line7 = CreateGreasedLine('line6', {points: points7, widths: widths7}, {width: 0.2, color: Color3.Gray()})

    return scene;
  }
}