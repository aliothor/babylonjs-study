import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";
import Coordinate from "../../Beginner/Coordinate";

export default class IndividualFaceNumbers {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Individual Face Numbers'
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

    const axis = new Coordinate(scene)
    axis.showAxis(1)

    const mat = new StandardMaterial('mat')
    const texture = new Texture('/Materials/numbers.jpeg')
    mat.diffuseTexture = texture

    // alien sprite
    const cols = 6
    const rows = 1
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }
    const options = {
      faceUV: faceUV,
      wrap: true
    }

    const box = MeshBuilder.CreateBox('box', options);
    box.material = mat

    return scene;
  }
}