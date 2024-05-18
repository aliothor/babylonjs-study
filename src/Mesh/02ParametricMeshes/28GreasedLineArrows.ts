import { ArcRotateCamera, Axis, Color3, CreateGreasedLine, Debug, Engine, GreasedLineTools, Scene, Vector3 } from "babylonjs";

export default class GreasedLineArrows {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Arrows'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // 1
    const points1 = [
      new Vector3(0, 0, 0),
      new Vector3(10, 0, 0)
    ]
    const line1 = CreateGreasedLine('line1', {
      points: points1
    }, {
      color: Color3.Red()
    })

    // arrow
    const cap1 = GreasedLineTools.GetArrowCap(
      points1[1], Vector3.Right(), 0.4, 4, 4
    )
    CreateGreasedLine('lines', {
      points: cap1.points,
      widths: cap1.widths,
      instance: line1
    })

    // 2
    const line2 = line1.clone()
    line2.scaling = new Vector3(0.7, 0.7, 0.7)

    // animation
    scene.onBeforeRenderObservable.add(() => {
      line1.rotate(Axis.Z, 0.002 * scene.getAnimationRatio())
      line2.rotate(Axis.Z, 0.001 * scene.getAnimationRatio())
    })

    new Debug.AxesViewer()

    return scene;
  }
}