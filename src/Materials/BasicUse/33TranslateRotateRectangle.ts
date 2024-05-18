import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class TranslateRotateRectangle {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Translate And Rotate Rectangle'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerAlphaLimit = -3
    camera.upperAlphaLimit = -0.125

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const plane = MeshBuilder.CreatePlane('plane', {size: 4})
    const mat = new StandardMaterial('mat')
    plane.material = mat

    const texSize = 512
    const dynTex = new DynamicTexture('dynText', texSize)
    const ctx = dynTex.getContext()

    mat.diffuseTexture = dynTex

    let offset = 0
    scene.onBeforeRenderObservable.add(() => {
      ctx.clearRect(0, 0, texSize, texSize)
      ctx.save()
      ctx.fillStyle = 'DarkRed'
      ctx.fillRect(0, 0, texSize, texSize)

      const left = 0
      const top = texSize - (texSize * 0.25)
      const width = 0.25 * texSize
      const height = 0.25 * texSize

      const offsetU = ((Math.sin(offset) * 0.5) + 0.5) * (texSize - (texSize * 0.25))
      const offsetV = ((Math.sin(offset) * 0.5) + 0.5) * (-texSize + (texSize * 0.25))

      const rectangleU = width * 0.5 + left
      const rectangleV = height * 0.5 + top
      ctx.translate(rectangleU + offsetU, rectangleV + offsetV)

      ctx.rotate(offset)

      ctx.fillStyle = 'DarkOrange'
      ctx.fillRect(-width * 0.5, -height * 0.5, width, height)

      ctx.restore()
      dynTex.update()

      offset += 0.01
    })

    return scene;
  }
}