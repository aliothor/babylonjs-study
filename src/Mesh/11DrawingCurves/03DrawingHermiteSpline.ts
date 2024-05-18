import { ArcRotateCamera, AxesViewer, Color4, Curve3, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class DrawingHermiteSpline {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing a Hermite Spline'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 120, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    const hermite = Curve3.CreateHermiteSpline(
      Vector3.Zero(),
      new Vector3(-30, 30, -100),
      new Vector3(20, 10, 40),
      new Vector3(90, -30, -30), 
      60
    )
    const hermiteSpline = MeshBuilder.CreateLines('hermiteSpline', {points: hermite.getPoints()})

    new AxesViewer(scene, 20)

    return scene;
  }
}