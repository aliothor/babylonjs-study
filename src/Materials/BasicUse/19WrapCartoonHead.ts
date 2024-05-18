import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";
import Coordinate from "../Beginner/Coordinate";

export default class WrapCartoonHead {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Wrap Cartoon Head'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene);
    light1.intensity = 0.5

    // const axis = new Coordinate(scene)
    // axis.showAxis(1)

    const mat = new StandardMaterial('mat')
    const texture = new Texture('/Materials/head.jpeg')
    mat.diffuseTexture = texture

    // alien sprite
    const cols = 3
    const rows = 2
    const faceUV = new Array<Vector4>(6)
    faceUV[0] = new Vector4(0 / cols, 1 / rows, 1 / cols, 2 / rows)
    faceUV[1] = new Vector4(1 / cols, 0 / rows, 2 / cols, 1 / rows)
    faceUV[2] = new Vector4(2 / cols, 0 / rows, 3 / cols, 1 / rows)
    faceUV[3] = new Vector4(0 / cols, 0 / rows, 1 / cols, 1 / rows)
    faceUV[4] = new Vector4(1 / cols, 1 / rows, 2 / cols, 2 / rows)
    faceUV[5] = new Vector4(2 / cols, 1 / rows, 3 / cols, 2 / rows)
    const options = {
      faceUV: faceUV,
      wrap: true
    }

    const box = MeshBuilder.CreateBox('box', options);
    box.material = mat

    return scene;
  }
}