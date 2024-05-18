import { ArcRotateCamera, Color3, CreateGreasedLine, CubeTexture, Engine, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, GreasedLineTools, PBRMaterial, Scene, Vector3 } from "babylonjs";

export default class DrawingText {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing Text'
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

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/room.dds', scene)

    function drawText(points: number[][], width = 0.4) {
      const textLines = CreateGreasedLine('textLines', {points}, {
        materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
        colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
        width
      })
      return textLines
    }

    fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json').then(data => {
      data.json().then(fontData => {
        // 1
        const points1 = GreasedLineTools.GetPointsFromText(
          'Babylon', 16, 4, fontData
        )
        
        const textLine1 = drawText(points1)
        const pbr1 = textLine1.material as PBRMaterial
        pbr1.metallic = 1
        pbr1.roughness = 0

        // 2
        const points2 = GreasedLineTools.GetPointsFromText(
          'JS', 16, 64, fontData
        )
        
        const textLine2 = drawText(points2, 0.8)
        textLine2.position.x = 81.35
        const pbr2 = textLine2.material as PBRMaterial
        pbr2.metallic = 1
        pbr2.roughness = 0

        // 3
        const points3 = GreasedLineTools.GetPointsFromText(
          'GreasedLine', 16, 64, fontData
        )
        
        const textLine3 = drawText(points3)
        textLine3.position.y = 20
        const pbr3 = textLine3.material as PBRMaterial
        pbr3.metallic = 0
        pbr3.roughness = 0

        pbr3.subSurface.isRefractionEnabled = true
        pbr3.subSurface.indexOfRefraction = 1.5
        pbr3.subSurface.tintColor = new Color3(0.53, 0.04, 0.93)


        camera.zoomOnFactor = 1.1
        camera.zoomOn([textLine1, textLine2, textLine3])

      })
    })

    return scene;
  }
}