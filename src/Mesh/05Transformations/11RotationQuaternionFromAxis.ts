import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class RotationQuaternionFromAxis {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotation Quaternion From Axis'
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

    const box = MeshBuilder.CreateBox('box', {width: 0.5, depth: 0.2, height: 0.7});
    box.position.x = 0.5
    box.position.y = -0.35
    const cone = MeshBuilder.CreateCylinder('cone', {diameterTop: 0, diameterBottom: 1, height: 1.5})
    const mesh = Mesh.MergeMeshes([cone, box])!
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = Color3.Yellow()
    mesh.material = mat

    new AxesViewer()

    // axis
    const upAxis = new Vector3(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random()).normalize()
    const upLine = MeshBuilder.CreateLines('upLine', {points: [Vector3.Zero(), upAxis.scale(5)]})
    upLine.color = Color3.Green()

    const vec = new Vector3(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random()).normalize()
    const rightAxis = Vector3.Cross(vec, upAxis).normalize()
    const forwardAxis = Vector3.Cross(rightAxis, upAxis).normalize()

    const rightLine = MeshBuilder.CreateLines('rightLine', {points: [Vector3.Zero(), rightAxis.scale(5)]})
    rightLine.color = Color3.Red()
    const forwardLine = MeshBuilder.CreateLines('forwardLine', {points: [Vector3.Zero(), forwardAxis.scale(5)]})
    forwardLine.color = Color3.Blue()

    // mesh.rotation = Vector3.RotationFromAxis(rightAxis, upAxis, forwardAxis)
    mesh.rotationQuaternion = Quaternion.RotationQuaternionFromAxis(rightAxis, upAxis, forwardAxis)

    return scene;
  }
}