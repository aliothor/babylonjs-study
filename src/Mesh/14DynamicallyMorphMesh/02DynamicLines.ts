import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class DynamicLines {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Dynamic Lines'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // line creation
    const points: Vector3[] = []
    for (let i = -20; i < 20; i++) {
      points.push(new Vector3(i, 0, 0))
    }
    let mesh = MeshBuilder.CreateLines('lines', {points, updatable: true})

    // update
    function update(pts: Vector3[], t: number) {
      for (let i = 0; i < pts.length; i++) {
        pts[i].y = 5 * Math.sin(i / 3 + t)
      }
    }

    let t = 0
    scene.registerBeforeRender(() => {
      update(points, t)
      mesh = MeshBuilder.CreateLines('lines', {points, instance: mesh})
      t += 0.03
    })

    return scene;
  }
}