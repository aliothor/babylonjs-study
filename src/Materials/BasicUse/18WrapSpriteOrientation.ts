import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class WrapSpriteOrientation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Wrap Sprite Orientation'
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

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/alphabet.jpeg')

    // sprite
    const cols = 6
    const rows = 1
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    // 1
    const box = MeshBuilder.CreateBox('box', {
      size: 3,
      faceUV: faceUV,
      wrap: true
    });
    box.material = mat
    box.position = new Vector3(-3, 0, 0)

    // 2
    const box1 = MeshBuilder.CreateBox('box1', {
      size: 3, 
      faceUV: faceUV,
      wrap: true,
      topBaseAt: 2,
      bottomBaseAt: 3
    })
    box1.material = mat
    box1.position = new Vector3(3, 0, 0)

    scene.registerBeforeRender(function() {
      pl.position = camera.position
    })

    return scene;
  }
}