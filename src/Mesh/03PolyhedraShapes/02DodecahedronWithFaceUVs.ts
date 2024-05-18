import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class DodecahedronWithFaceUVs {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Dodecahedron With FaceUVs'
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

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/spriteAtlas.png')

    const cols = 6
    const rows = 4
    const faceUV = []
    for (let i = 0; i < 12; i++) {
      faceUV[i] = new Vector4((i % 6) / cols, Math.floor(i / 6) / rows, (i % 6 + 1) / cols, Math.floor(i / 6 + 1) / rows)
    }
    const dodecahedron = MeshBuilder.CreatePolyhedron('dodecahedron', {
      type: 2,
      faceUV: faceUV
    })
    dodecahedron.material = mat

    return scene;
  }
}