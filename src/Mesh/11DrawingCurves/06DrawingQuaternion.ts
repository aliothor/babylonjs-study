import { ArcRotateCamera, AxesViewer, Color3, Curve3, Engine, HemisphericLight, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class DrawingQuaternion {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing Quaternion'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const hermiteQuarternionSpline = (p1: Quaternion, t1: Quaternion, p2: Quaternion, t2: Quaternion, nbPoints: number) => {
      const hermite = new Array<Vector3>();
      const step = 1.0 / nbPoints;
      for (let i = 0; i <= nbPoints; i++) {
        const q = Quaternion.Hermite(p1, t1, p2, t2, i * step);
        q.normalize();
        if (q.w < 0) {
          q.scaleInPlace(-1);
        }
        const v = new Vector3(q.x / (1 + q.w), q.y / (1 + q.w), q.z / (1 + q.w));
        hermite.push(v);
      }
      return new Curve3(hermite);
    };

    const pt1 = new Quaternion(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random(), 0)
    pt1.normalize()
    const tang1 = new Quaternion(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random(), 10)
    tang1.normalize()
    const pt2 = new Quaternion(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random(), 0)
    pt2.normalize()
    const tang2 = new Quaternion(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random(), 15)
    tang2.normalize()

    const hermiteCurve = hermiteQuarternionSpline(pt1, tang1, pt2, tang2, 100)

    const hermiteLine = MeshBuilder.CreateLines('hermiteLine', {points: hermiteCurve.getPoints()})

    const outerSphere = MeshBuilder.CreateSphere('outerSphere', {diameter: 2})
    const osMat = new StandardMaterial('osMat')
    osMat.diffuseColor = Color3.Yellow()
    osMat.alpha = 0.25
    outerSphere.material = osMat

    new AxesViewer()


    return scene;
  }
}