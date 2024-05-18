import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class CreateBasicTube {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Basic Tube'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 25, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    //Array of paths to construct tube
    const myPath = [
      new Vector3(5.0, 0, 0.0),
      new Vector3(0, 1, 0.1),
      new Vector3(-4.0, 6, 0.2)
    ]
    let tube = MeshBuilder.CreateTube('tube', {
      path: myPath,
      radius: 0.5,
      sideOrientation: Mesh.DOUBLESIDE,
      cap: Mesh.CAP_END,
      updatable: true
      // tessellation: 8
    })
    // tube.material = new StandardMaterial('mat')
    // tube.material.wireframe = true


    const myPath2 = [
      new Vector3(5, 0, 0),
      new Vector3(0, 1, 0.1),
      new Vector3(-4, 1, 0.2)
    ]

    setTimeout(() => {
      tube = MeshBuilder.CreateTube('tube', {
        path: myPath2,
        radius: 2,
        instance: tube
      })
    }, 2000);

    return scene;
  }
}