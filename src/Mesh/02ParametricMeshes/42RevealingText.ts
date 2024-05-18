import { ArcRotateCamera, Color3, Color4, CreateGreasedLine, CubeTexture, Engine, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, GreasedLineTools, PBRMaterial, Scene, Vector3 } from "babylonjs";

export default class RevealingText {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Revealing Text'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(0, 0, 0, 1)
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/room.dds', scene)

    setTimeout(async () => {
      await drawText()
    })

    async function drawText() {
      const fontData = await (await fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json')).json()

      const points = GreasedLineTools.GetPointsFromText('SUSEMECH', 20, 4, fontData)

      const textLine = CreateGreasedLine('textLine', {points}, {
        color: Color3.Green(),
        materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
        colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
        width: 1.9
      })
      const pbr = textLine.material as PBRMaterial
      pbr.metallic = 1
      pbr.roughness = 0

      camera.zoomOn([textLine])

      let v = 0
      scene.onBeforeRenderObservable.add(() => {
        if (v > 1) return
        textLine.greasedLineMaterial!.visibility = v
        v += 0.003 * scene.getAnimationRatio()
      })
    }

    return scene;
  }
}