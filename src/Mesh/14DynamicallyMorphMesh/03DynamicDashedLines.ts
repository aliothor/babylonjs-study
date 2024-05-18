import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class DynamicDashedLines {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Dynamic Dashed Lines'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.8, 0.8, 0.8, 1)

    // dash line
    const points: Vector3[] = []
    const nb = 20
    const step = 2 * Math.PI / nb
    for (let i = 0; i < nb; i += step) {
      points.push(new Vector3(3 * Math.cos(i), i / 3 - 2, 3 * Math.sin(i)))
    }
    let dl = MeshBuilder.CreateDashedLines('dl', {points, updatable: true})
    dl.color = Color3.Blue() 

    // update
    function updatePoints(t: number) {
      for (let i = 0; i < points.length; i++) {
        points[i].x = 3 * Math.cos(i / 3 + t)
        points[i].y = 8 * Math.sin(i / 10 + t)
        points[i].z = 3 * Math.sin(i / 3 + t)
      }
    }

    let t = 0
    scene.registerBeforeRender(() => {
      updatePoints(t)
      dl = MeshBuilder.CreateDashedLines('dl', {points, instance: dl})
      t += 0.01
    })

    return scene;
  }
}