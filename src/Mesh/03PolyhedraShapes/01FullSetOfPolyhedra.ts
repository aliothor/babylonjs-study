import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class FullSetOfPolyhedra {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Full Set Of 15 Polyhedra'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 80, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    for (let i = 0; i < 15; i++) {
      const shape = MeshBuilder.CreatePolyhedron('shape' + i, {
        type: i,
        size: 3
      })
      shape.position = new Vector3(-30 + 15 * (i % 5), 20 + (-15 * Math.floor(i / 5)), 0)
    }

    return scene;
  }
}