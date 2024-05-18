import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, Matrix, Mesh, MeshBuilder, Scene, Space, TransformNode, Vector3 } from "babylonjs";

export default class UsePivotCenterRotation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Use Pivot as a Center of Rotation'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.5, 25, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    new AxesViewer(scene, 5)

    // pilot
    const body = MeshBuilder.CreateCylinder('body', {height: 0.75, diameterTop: 0, diameterBottom: 0.5, tessellation: 6, subdivisions: 1})
    const arm = MeshBuilder.CreateBox('arm', {height: 0.75, width: 0.3, depth: 0.18});
    arm.position.x = 0.125
    const pilot = Mesh.MergeMeshes([body, arm], true)!

    // set center of rotation
    const corAt = new Vector3(1, 3, 2)
    const axis = new Vector3(2, 6, 4)
    const pilotStart = new Vector3(2, 3, 4)

    // draw axis and center
    const axisLine = MeshBuilder.CreateLines('axisLine', {points: [corAt.add(axis.scale(-50)), corAt.add(axis.scale(50))]})
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.25})

    // parent at pivot position
    pilot.parent = sphere
    const pilotTranslate = pilotStart.subtract(corAt)
    pilot.setPivotMatrix(Matrix.Translation(pilotTranslate.x, pilotTranslate.y, pilotTranslate.z))
    pilot.position = pilotTranslate

    // rotate animation
    const angle = 0.02
    let a = Math.PI / 2
    const axisNormal = axis.normalize()
    const direction = new Vector3(2, 1, 3).normalize()
    scene.onBeforeRenderObservable.add(() => {
      pilot.rotate(axis, angle, Space.WORLD)
      a += 0.005
      const sign = Math.cos(a) / Math.abs(Math.cos(a))
      sphere.position = sphere.position.add(axisNormal.scale(0.01 * sign))
      sphere.position = sphere.position.add(direction.scale(0.01 * sign))
      axisLine.position = axisLine.position.add(direction.scale(0.01 * sign))
    })

    return scene;
  }
}