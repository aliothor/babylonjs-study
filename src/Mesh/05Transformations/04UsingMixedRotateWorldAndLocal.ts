import { ArcRotateCamera, Axis, Debug, Engine, HemisphericLight, Mesh, MeshBuilder, Quaternion, Scene, Space, Vector3 } from "babylonjs";
import Coordinate from "../../Beginner/Coordinate";

export default class UsingMixedRotateWorldAndLocal {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Mixed Rotate World and Local'
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

    // pilot
    const body = MeshBuilder.CreateCylinder('body', {height: 0.75, diameterTop: 0.2, diameterBottom: 0.5, tessellation: 6, subdivisions: 1})
    const arm = MeshBuilder.CreateBox('arm', {height: 0.75, width: 0.3, depth: 0.1875});
    arm.position.x = 0.125
    const pilot = Mesh.MergeMeshes([body, arm], true)

    const localOrigin = new Coordinate(scene)
    localOrigin.localAxes(1).parent = pilot

    new Debug.AxesViewer(scene, 2)

    const totalTicks = 250
    let tick = 0
    const angleX = Math.PI / 4
    const angleY = Math.PI / 4

    scene.onBeforeRenderObservable.add(() => {
      if (tick <= totalTicks) {
        pilot?.rotate(Axis.Y, angleY / totalTicks, Space.WORLD)
      }
      if (tick > totalTicks) {
        pilot?.rotate(Axis.X, angleX / totalTicks, Space.WORLD)
      }
      if (tick == 2 * totalTicks) {
        pilot!.rotationQuaternion = Quaternion.Identity()
        tick = -1
      }
      tick++
    })

    return scene;
  }
}