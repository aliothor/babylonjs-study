import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CreateSpiralLines {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Spiral Lines'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const myPoints: Vector3[] = []
    const radius = 1
    const deltaTheta = 0.1
    let deltaY = 0.005
    let theta = 0
    let Y = 0
    for (let i = 0; i < 400; i++) {
      myPoints.push(new Vector3(radius * Math.cos(theta), Y, radius * Math.sin(theta)))
      theta += deltaTheta
      Y += deltaY
    }
    let lines = MeshBuilder.CreateLines('lines', {points: myPoints, updatable: true})

    setTimeout(() => {
      deltaY = 0.001
      theta = 0
      Y = 0
      for (let i = 0; i < myPoints.length; i++) {
        myPoints[i] = new Vector3(radius * Math.cos(theta), Y, radius * Math.sin(theta))
        theta += deltaTheta
        Y += deltaY
      }
      lines = MeshBuilder.CreateLines('lines', {points: myPoints, instance: lines})
    }, 3000);

    return scene;
  }
}