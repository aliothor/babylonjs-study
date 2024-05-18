import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class UnderstandingFaceOrientationWithSprites {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Understanding Face Orientation With Sprites'
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
    mat.diffuseTexture = new Texture('/Materials/spriteAtlas.png')

    // sprite
    const cols = 6
    const rows = 4
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(0, 0, 0, 0)
    }

    // orientation
    const ULeft = 3 / cols
    const URight = 4 / cols
    const VBottom = 0
    const VTop =  1 / rows

    // 1
    faceUV[1] = new Vector4(ULeft, VBottom, URight, VTop)
    const box = MeshBuilder.CreateBox('box', {
      size: 3,
      faceUV: faceUV
    });
    box.material = mat
    box.position = new Vector3(-3, -3, 0)

    // 2
    faceUV[1] = new Vector4(URight, VBottom, ULeft, VTop)
    const box1 = MeshBuilder.CreateBox('box1', {size: 3, faceUV: faceUV})
    box1.material = mat
    box1.position = new Vector3(3, -3, 0)

    // 3
    faceUV[1] = new Vector4(ULeft, VTop, URight, VBottom)
    const box2 = MeshBuilder.CreateBox('box2', {size: 3, faceUV: faceUV})
    box2.material = mat
    box2.position = new Vector3(-3, 3, 0)
 
    // 4
    faceUV[1] = new Vector4(URight, VTop, ULeft, VBottom)
    const box3 = MeshBuilder.CreateBox('box3', {size: 3, faceUV: faceUV})
    box3.material = mat
    box3.position = new Vector3(3, 3, 0)

    scene.registerBeforeRender(function() {
      pl.position = camera.position
    })

    return scene;
  }
}