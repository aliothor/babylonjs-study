import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class DifferentTextureOnCylinder {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Texture On Cylinder'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene)

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/cylinder.jpeg')

    const faceUV = []
    faceUV[0] = new Vector4(0, 0, 0, 0)
    faceUV[1] = new Vector4(1, 0, 0.32, 1)
    faceUV[2] = new Vector4(0.02, 0.04, 0.25, 0.9)

    const faceColors = []
    faceColors[0] = new Color4(0.5, 0.5, 0.5, 1)

    const can = MeshBuilder.CreateCylinder('can', {
      height: 1.16,
      faceUV: faceUV,
      faceColors: faceColors
    })
    can.material = mat

    return scene;
  }
}