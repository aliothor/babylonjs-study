import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, Scene, Vector3 } from "babylonjs";

export default class SimpleMaterialInMultiplyColorMode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simple Material In Multiply Color Mode'
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

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const points1 = [
      -5, 6, 0,
      5, 6, 0,
      5, 7, 0,
      5, 12, 0
    ]
    const color1 = [Color3.Red(), Color3.Green(), Color3.Blue()]
    const line1 = CreateGreasedLine('line1', {points: points1}, {
      materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_SIMPLE,
      colors: color1,
      useColors: true,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })

    camera.zoomOn([line1])

    // animation
    let c = 0
    const color = new Color3()
    scene.onBeforeRenderObservable.add(() => {
      color.r = c
      color.g = c
      color.b = c
      line1.greasedLineMaterial!.color = color
      c += 0.004 * scene.getAnimationRatio()
      if (c >= 1) c = 0
    })

    return scene;
  }
}