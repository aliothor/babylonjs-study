import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class IncorrectlyCappedExtrusion {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Incorrectly Capped Extrusion'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    //Shape profile in XY plane
    const myShape = [
      new Vector3(-5, -5, 0),
      new Vector3(5, -5, 0),
      new Vector3(5, 5, 0),
      new Vector3(3, 5, 0),
      new Vector3(3, -3, 0),
      new Vector3(-2, -3, 0),
      new Vector3(-2, 1, 0),
      new Vector3(-5, 1, 0)
    ];


    const myPath = [
      new Vector3(0, 1, 0),
      new Vector3(0, 1.5, 2),
      new Vector3(0, 2.25, 4),
      new Vector3(0, 3.37, 6),
      new Vector3(0, 5.06, 8),
      new Vector3(0, 8.32, 10)
    ];

    const shape = MeshBuilder.CreateLines('shape', { points: myShape })
    shape.color = Color3.Teal()

    const path = MeshBuilder.CreateLines('path', { points: myPath })
    path.color = Color3.Magenta()
    
    const extrusion = MeshBuilder.ExtrudeShape('extrusion', {
      shape: myShape,
      path: myPath,
      sideOrientation: Mesh.DOUBLESIDE,
      closeShape: true,
      // cap: Mesh.CAP_START
    })
    // extrusion.material = new StandardMaterial('mat')
    // extrusion.material.wireframe = true

    return scene;
  }
}