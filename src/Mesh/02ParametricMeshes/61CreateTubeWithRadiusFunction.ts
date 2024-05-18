import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CreateTubeWithRadiusFunction {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Tube With Radius Function'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    function makeCurve(range: number, nbSteps: number) {
      const path: Vector3[] = []
      const step = range / nbSteps
      for (let i = -range / 2; i < range / 2; i += step) {
        // 1
        // let t = i / Math.PI * 2
        // let x = Math.sin(t) + i
        // path.push(new Vector3(x, 0, 0))

        // 3
        path.push(new Vector3(5 * Math.sin(i * nbSteps / 400), 5 * Math.cos(i * nbSteps / 400), 0))
      }

      return path
    }

    // 1 2
    // const curve = makeCurve(40, 400)

    // 3
    const curve = makeCurve(40, 100)

    // 1
    // function radiusChange(idx: number, dist: number) {
    //   const radius = dist / 2
    //   return radius
    // }

    // 2
    function radiusChange(idx: number, dist: number) {
      const t = (idx / Math.PI * 2) / 8
      const radius = Math.sin(t) + idx / 25
      return radius
    }

    const tube = MeshBuilder.CreateTube('tube', {
      path: curve,
      radiusFunction: radiusChange,
      sideOrientation: Mesh.DOUBLESIDE
    })

    return scene;
  }
}