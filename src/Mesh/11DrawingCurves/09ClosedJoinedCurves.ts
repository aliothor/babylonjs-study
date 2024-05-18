import { ArcRotateCamera, AxesViewer, Color3, Curve3, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class ClosedJoinedCurves {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Closed Joined Curves'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 300, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.target.y = 80

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    new AxesViewer(scene, 20)

    const quadraticBezierVectors = Curve3.CreateQuadraticBezier(
      new Vector3(-5, -2, -10),
      new Vector3(50, 30, 10),
      new Vector3(20, 50, 0),
      25
    )
    const quadraticBezierCurve = MeshBuilder.CreateLines('qbezier', {points: quadraticBezierVectors.getPoints()})
    quadraticBezierCurve.color = new Color3(1, 1, 0.5)

    const cubicBezierVectors = Curve3.CreateCubicBezier(
      new Vector3(5, 5, -5),
      new Vector3(30, 30, 40),
      new Vector3(-60, 50, -40),
      new Vector3(-30, 60, 30),
      60
    )
    const cubicBezierCurve = MeshBuilder.CreateLines('cbezier', {points: cubicBezierVectors.getPoints()})
    cubicBezierCurve.color = new Color3(1, 0.6, 0)

    let continued = cubicBezierVectors.continue(cubicBezierVectors).continue(quadraticBezierVectors)

    const points = continued.getPoints()
    // MeshBuilder.CreateLines('t', {points}).color = Color3.Red()

    const l = continued.length() / 2
    const p1 = points[points.length - 1]
    const t1 = p1.subtract(points[points.length - 2]).scale(l)
    const p2 = points[0]
    const t2 = points[1].subtract(p2).scale(l)

    const hermite = Curve3.CreateHermiteSpline(p1, t1, p2, t2, 60)
    continued = continued.continue(hermite)

    const continuedCurve = MeshBuilder.CreateLines('continued', {points: continued.getPoints()})
    continuedCurve.color = new Color3(0.5, 0.5, 1)


    return scene;
  }
}