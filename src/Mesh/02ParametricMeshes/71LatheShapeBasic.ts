import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class LatheShapeBasic {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Lathe Shape Basic Parameters'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 70, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const myShape = [
      new Vector3(0, 0, 0),
      new Vector3(10, 5, 0),
      new Vector3(5, 10, 0),
      new Vector3(12, 15, 0),
      new Vector3(3, 20, 0)
    ];

    const shape = MeshBuilder.CreateLines('shape', { points: myShape })
    shape.color = Color3.Magenta()

    const lathe = MeshBuilder.CreateLathe('lathe', {
      shape: myShape,
      sideOrientation: Mesh.DOUBLESIDE,
      arc: 0.75,
      closed: false,
      cap: Mesh.CAP_END
    })
    

    return scene;
  }
}