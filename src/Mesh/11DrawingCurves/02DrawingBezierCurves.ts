import { ArcRotateCamera, AxesViewer, Color3, Color4, Curve3, Engine, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class DrawingBezierCurves {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing Bezier Curves'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 150, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    new AxesViewer(scene, 20)

    const qBezier = Curve3.CreateQuadraticBezier(
      Vector3.Zero(),
      new Vector3(50, 30, 10),
      new Vector3(20, 50, 0),
      25
    )
    const qCurve = MeshBuilder.CreateLines('qCurve', {points: qBezier.getPoints()})
    qCurve.color = new Color3(1, 1, 0.5)

    const cBezier = Curve3.CreateCubicBezier(
      Vector3.Zero(),
      new Vector3(30, 30, 40),
      new Vector3(-60, 50, -40),
      new Vector3(-30, 60, 30),
      60
    )
    const cCurve = MeshBuilder.CreateLines('cCurve', {points: cBezier.getPoints()})
    cCurve.color = new Color3(1, 0.6, 0)

    return scene;
  }
}