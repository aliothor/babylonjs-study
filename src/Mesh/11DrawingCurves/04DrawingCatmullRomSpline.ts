import { ArcRotateCamera, AxesViewer, Color4, Curve3, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class DrawingCatmullRomSpline {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing a Catmull-Rom Spline'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    new AxesViewer(scene, 20)

    const points = [
      Vector3.Zero(),
      new Vector3(10, 1, 5),
      new Vector3(20, 16, 20),
      new Vector3(25, -21, 15),
      new Vector3(35, 30, 0)
    ]
    const catmullRom = Curve3.CreateCatmullRomSpline(points, 60, true)

    const catmullRomSpline = MeshBuilder.CreateLines('catmullRomSpline', {points: catmullRom.getPoints()})

    points.forEach(p => {
      const s = MeshBuilder.CreateSphere('', {diameter: 2})
      s.position = p
    })

    return scene;
  }
}