import { ArcRotateCamera, AxesViewer, Color3, Curve3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class JoiningCurves {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Joining Curves'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    new AxesViewer(scene, 20)

    const mySinus = []
    for (let i = 0; i < 180; i++) {
      mySinus.push(new Vector3(i / 2, 10 * Math.sin(8 * i * Math.PI / 180)))
    }
    const mySinusCurve = new Curve3(mySinus)
    MeshBuilder.CreateLines('sinus', {points: mySinusCurve.getPoints()}).color = Color3.Red()
    

    const bezier3 = Curve3.CreateCubicBezier(
      Vector3.Zero(),
      new Vector3(30, 30, 40),
      new Vector3(-60, 50, -40),
      new Vector3(-30, 60, 30),
      60
    )
    MeshBuilder.CreateLines('b3', {points: bezier3.getPoints()}).color = Color3.Green()

    const bezier2 = Curve3.CreateQuadraticBezier(
      Vector3.Zero(),
      new Vector3(50, 30, 10),
      new Vector3(20, 50, 0),
      25
    )
    MeshBuilder.CreateLines('b2', {points: bezier2.getPoints()}).color = Color3.Yellow()

    const myFullCurve = mySinusCurve.continue(bezier3).continue(bezier2)

    const path = myFullCurve.getPoints()
    // MeshBuilder.CreateLines('path', {points: path}).color = Color3.Teal()

    const shape = []
    for (let i = 0; i < 2 * Math.PI; i += Math.PI / 64) {
      shape.push(new Vector3(2 * Math.cos(4 * i) * Math.cos(i), 2 * Math.cos(4 * i) * Math.sin(i), 0))
    }
    MeshBuilder.CreateLines('shape', {points: shape}).color = Color3.Magenta()

    const exturded = MeshBuilder.ExtrudeShape('exturded', {shape, path, sideOrientation: Mesh.DOUBLESIDE})

    return scene;
  }
}