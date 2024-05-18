import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorDistribution, Scalar, Scene, Vector3 } from "babylonjs";

export default class OffsettingLineVertices {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Offsetting Line Vertices'
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

    const points1 = []
    const colors1 = [Color3.Red(), Color3.Green(), Color3.Blue()]
    const offsets: number[] = []
    const targetOffsetsY: number[] = []
    const offsetY: number[] = []
    for (let x = 0; x < 10; x += 0.25) {
      points1.push([new Vector3(x, 0, 0), new Vector3(x, 1, 0)])
      offsets.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      targetOffsetsY.push(0)
      offsetY.push(0)
    }
    const line1 = CreateGreasedLine('line1', {
      points: points1,
      updatable: true
    }, {
      useColors: true,
      colors: colors1,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_REPEAT
    })

    setInterval(() => {
      targetOffsetsY.length = 0
      for (let i = 0; i < 10; i += 0.25) {
        const y = Scalar.RandomRange(1, 4)
        targetOffsetsY.push(y)
      }
    }, 1000)

    scene.onBeforeRenderObservable.add(() => {
      offsets.length = 0
      for (let i = 0, j = 0; i < 10; i += 0.25, j++) {
        const y = Scalar.Lerp(offsetY[j], targetOffsetsY[j], 0.05)
        offsetY[j] = y
        offsets.push(0, 0, 0, 0, 0, 0, 0, y, 0, 0, y, 0)
      }
      line1.offsets = offsets
    })

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1])

    return scene;
  }
}