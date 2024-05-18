import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CreateSpiralTube {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Spiral Tube'
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
        path.push(new Vector3(5 * Math.sin(i * nbSteps / 400), i, 5 * Math.cos(i * nbSteps / 400)))
      }

      return path
    }

    const curve = makeCurve(40, 100)
    const tube = MeshBuilder.CreateTube('tube', {
      path: curve,
      radius: 2,
      sideOrientation: Mesh.DOUBLESIDE
    })

    return scene;
  }
}