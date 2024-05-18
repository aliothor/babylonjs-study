import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Space, StandardMaterial, Vector3 } from "babylonjs";
import Coordinate from "../../Beginner/Coordinate";

export default class PurpleAndBrownRotationInWorldAndLocalSpace {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Purple and Brown Rotation in World and Local Space'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3.5, 8, new Vector3(5, 3, 0));
    camera.setPosition(new Vector3(10.253, 5.82251, -9.45717))
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // pilot
    const body = MeshBuilder.CreateCylinder('body', {height: 0.75, diameterTop: 0.2, diameterBottom: 0.5, tessellation: 6, subdivisions: 1})
    const arm = MeshBuilder.CreateBox('arm', {height: 0.75, width: 0.3, depth: 0.1875});
    arm.position.x = 0.125
    const pilot = Mesh.MergeMeshes([body, arm], true)
    pilot.position = new Vector3(0, 3, 4);
    pilot.rotation = new Vector3(Math.PI / 3, -11 * Math.PI / 16, Math.PI / 2);

    const localOrigin = new Coordinate(scene)
    localOrigin.localAxes(1).parent = pilot

    localOrigin.showAxis(3)

    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(1, 0, 1)
    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(1, 0.6, 0)

    // create axis for rotation
    const axis = new Vector3(2, 0.2, 0)
    const drawAxis = MeshBuilder.CreateLines('axis', {
      points: [axis.scale(-1), axis]
    })
    drawAxis.parent = pilot

    const drawWorldAxis = MeshBuilder.CreateLines('Waxis', {
      points: [axis.scale(-1), axis]
    })
    drawWorldAxis.position = pilot.position
    drawWorldAxis.color = new Color3(1, 1, 0)

    const pilot1 = pilot!.clone('pilot1')
    pilot1.position.x = 5
    const drawWorldAxis1 = drawWorldAxis.clone('Waxis1')
    drawWorldAxis1.position = pilot1.position

    const deltaTheta = Math.PI / 256
    scene.onBeforeRenderObservable.add(() => {
      pilot?.rotate(axis, deltaTheta, Space.WORLD)
      pilot1.rotate(axis, deltaTheta, Space.LOCAL)
    })

    return scene;
  }
}