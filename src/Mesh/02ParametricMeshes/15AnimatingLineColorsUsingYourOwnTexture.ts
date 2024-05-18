import { ArcRotateCamera, CreateGreasedLine, Engine, GreasedLineMeshColorMode, HemisphericLight, MeshBuilder, RawTexture, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class AnimatingLineColorsUsingYourOwnTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Animating Line Colors Using Your Own Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const points: Vector3[] = []
    for (let x = 0; x < 10; x += 0.25) {
      points.push(new Vector3(x, Math.cos(x / 2), 0))
    }
    const texColors = new Uint8Array([
      255, 255, 255,
      0, 0, 255
    ])
    const tex = new RawTexture(
      texColors,
      texColors.length / 3,
      1,
      Engine.TEXTUREFORMAT_RGB,
      scene,
      false,
      false,
      Engine.TEXTURE_NEAREST_LINEAR
    )
    tex.wrapU = RawTexture.WRAP_ADDRESSMODE
    tex.name = 'blue-white-texture'

    const line = CreateGreasedLine('line', {points}, {
      width: 1,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })

    line.material.emissiveTexture = tex
    tex.uScale = 5

    // animation
    scene.onBeforeRenderObservable.add(() => {
      tex.uOffset += 0.01 * scene.getAnimationRatio()
    })


    camera.zoomOn([line])

    return scene;
  }
}