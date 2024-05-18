import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class RotationEvolvingWithDistance {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotation Evolving With The Distance'
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
      new Vector3(1, 1, 0),
      new Vector3(0.2, 1.3, 0),
      new Vector3(0, 1, 0),
      new Vector3(-0.2, 1.3, 0),
      new Vector3(-1, 1, 0),
    ];

    const myPath: Vector3[] = []
    for (let i = 0; i < 100; i++) {
      const point = new Vector3(i / 5 - 10, 0, 0)
      myPath.push(point)
    }

    const shape = MeshBuilder.CreateLines('shape', { points: myShape })
    shape.color = Color3.Teal()

    const path = MeshBuilder.CreateLines('path', { points: myPath })
    path.color = Color3.Magenta()

    function myRotation(i: number, distance: number) {
      // return distance / 75
      return Math.sin(distance / 2) * Math.PI / 8
    }

    const ext = MeshBuilder.ExtrudeShapeCustom('ext', {
      shape: myShape,
      path: myPath,
      sideOrientation: Mesh.DOUBLESIDE,
      rotationFunction: myRotation
    })

    return scene;
  }
}