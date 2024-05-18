import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";
import Coordinate from "../../Beginner/Coordinate";

export default class SequenceRotationsUsingAddRotation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sequence Rotations Using addRotation'
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

    // rotation
    const pilot1 = pilot!.clone('pilot1')
    const pilot2 = pilot!.clone('pilot2')

    pilot1.position.x = -3
    pilot2.position.x = 3

    pilot1.rotation = new Vector3(Math.PI / 3, Math.PI / 4, 0)

    pilot2.rotation.x = Math.PI / 3
    pilot2.addRotation(0, Math.PI / 4, 0)


    return scene;
  }
}