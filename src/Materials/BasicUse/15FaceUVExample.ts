import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class FaceUVExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'FaceUV Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7
    const pl = new PointLight('pl', Vector3.Zero(), scene)
    pl.intensity = 0.5

    // sprite
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/spriteAtlas.png')

    // faceUV
    const cols = 6
    const rows = 4
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    const box = MeshBuilder.CreateBox('box', {
      width: 10,
      height: 3,
      depth: 5,
      faceUV: faceUV
    });
    box.material = mat

    scene.registerBeforeRender(function() {
      pl.position = camera.position
    })

    return scene;
  }
}