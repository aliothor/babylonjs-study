import { ArcRotateCamera, Debug, Engine, HemisphericLight, MeshBuilder, Scene, Space, Vector3 } from "babylonjs";
import Coordinate from "../../Beginner/Coordinate";

export default class PositionMesh {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Position A Mesh'
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

    const box = MeshBuilder.CreateBox('box');
    box.position = new Vector3(-1, 2, 1)
    const box2 = box.clone()

    box.rotation.x = Math.PI / 8
    // box.position.addInPlace(new Vector3(2, 3, 4))
    // box2.translate(new Vector3(2, 3, 4), 1, Space.WORLD)

    const axis = new Coordinate(scene)
    axis.localAxes(3).parent = box
    // box.translate(new Vector3(2, 3, 4), 1, Space.LOCAL)
    // box.locallyTranslate(new Vector3(2, 3, 4))
    box.setPositionWithLocalVector(new Vector3(2, 3, 4))

    box2.position = Vector3.Zero()
    box2.setPositionWithLocalVector(new Vector3(2, 3, 4))



    new Debug.AxesViewer(scene, 5)

    return scene;
  }
}