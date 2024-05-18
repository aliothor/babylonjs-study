import { ArcRotateCamera, CreateGreasedLine, Engine, GreasedLineMeshColorMode, RawTexture, Scene, Vector3 } from "babylonjs";

export default class LineColorsUsingYourOwnTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Line Colors Using Your Own Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 1.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const line = CreateGreasedLine('line', {
      points: [-6, -4, 0, 6, 4, 0]
    }, {
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })

    const texColors = new Uint8Array([
      0, 240, 232,
      236, 0, 242,
      0, 240, 232,
      0, 37, 245
    ])
    const tex = new RawTexture(
      texColors,
      texColors.length / 3,
      1,
      Engine.TEXTUREFORMAT_RGB,
      scene,
      false,
      false,
      Engine.TEXTURE_LINEAR_LINEAR
    )
    tex.wrapU = RawTexture.WRAP_ADDRESSMODE
    tex.name = 'colorTex'

    line.material.emissiveTexture = tex


    camera.zoomOnFactor = 1.3
    camera.zoomOn([line])

    return scene;
  }
}