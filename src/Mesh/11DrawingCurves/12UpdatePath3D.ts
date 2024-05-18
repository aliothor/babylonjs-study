import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Path3D, Scene, Vector3 } from "babylonjs";

export default class UpdatePath3D {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Update Path3D'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    camera.radius = 50
    camera.beta = Math.PI / 2

    const points: Vector3[] = []
    for (let i = 0; i < 50; i++) {
      points.push(new Vector3(i - 25, 5 * Math.sin(i / 2 + Date.now() * 0.01), 0))
    }

    const path3d = new Path3D(points)

    let line = MeshBuilder.CreateLines('line', {points: path3d.getCurve(), updatable: true})

    scene.onBeforeRenderObservable.add(() => {
      points.forEach((p, i) => {
        p.y = 5 * Math.sin(i / 2 + Date.now() * 0.01)
      })
      path3d.update(points)

      line = MeshBuilder.CreateLines('line', {points: path3d.getCurve(), instance: line})
    })

    return scene;
  }
}