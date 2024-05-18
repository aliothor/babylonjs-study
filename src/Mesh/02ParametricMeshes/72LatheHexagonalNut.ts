import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class LatheHexagonalNut {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Lathe Hexagonal Nut'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    const myShape = [
      new Vector3(2, 0, 0),
      new Vector3(4, 0, 0),
      new Vector3(4, 2, 0),
      new Vector3(2, 2, 0)
    ];

    const shape = MeshBuilder.CreateLines('shape', { points: myShape })
    shape.color = Color3.Magenta()

    const lathe = MeshBuilder.CreateLathe('lathe', {
      shape: myShape,
      tessellation: 6,
      sideOrientation: Mesh.DOUBLESIDE,
      radius: 2
    })
    lathe.convertToFlatShadedMesh()

    return scene;
  }
}