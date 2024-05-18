import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class CreateTiledBoxWithDifferentFaceTextures {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Tiled Box With Different Face Textures'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    const cols = 6
    const rows = 1
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < cols; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    const box = MeshBuilder.CreateTiledBox('box', {
      width: 7,
      height: 4,
      depth: 4,
      tileSize: 1,
      tileWidth: 1,
      faceUV: faceUV,
      pattern: Mesh.FLIP_N_ROTATE_ROW
    })

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/arrows.jpg')
    box.material = mat

    return scene;
  }
}