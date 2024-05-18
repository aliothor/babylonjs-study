import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class DifferentColorsAndTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Colors And Texture'
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
    mat.diffuseColor = new Color3(0.5, 0.5, 1)

    // faceUV
    const cols = 6
    const rows = 4
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    const faceColors = new Array<Color4>(6)
    faceColors[1] = new Color4(0, 1, 0, 0.25)
    faceColors[4] = new Color4(1, 0, 0, 0.25)

    const box = MeshBuilder.CreateBox('box', {
      width: 10,
      height: 3,
      depth: 5,
      faceUV: faceUV,
      faceColors: faceColors
    });
    box.material = mat
    // box.hasVertexAlpha = true

    const faceColors_inner = new Array<Color4>(6)
    faceColors_inner[1] = new Color4(0, 0, 1, 1)
    faceColors_inner[4] = new Color4(0, 1, 0, 1)

    const box_inner = MeshBuilder.CreateBox('box_inner', {
      width: 3,
      height: 1,
      depth: 2,
      faceColors: faceColors_inner
    })

    scene.registerBeforeRender(function() {
      pl.position = camera.position
    })

    return scene;
  }
}