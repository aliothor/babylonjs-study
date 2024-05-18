import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class CreateCuboid {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Cuboid'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box', {width: 1, height: 0.25, depth: 0.75});

    const mat = new StandardMaterial('mat')
    // https://assets.babylonjs.com/environments/numbers.jpg
    mat.diffuseTexture = new Texture('/Materials/numbers.jpeg')

    const cols = 6
    const rows = 1
    const faceUV = new Array<Vector4>(6)
    for(let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    const box = MeshBuilder.CreateBox('box', {
      faceUV: faceUV,
      wrap: true,
      topBaseAt: 2,
      bottomBaseAt: 0
    })
    box.material = mat

    return scene;
  }
}