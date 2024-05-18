import { ArcRotateCamera, Color3, Color3Gradient, CreateGreasedLine, Engine, GradientHelper, GreasedLineMeshColorMode, GreasedLineTools, Scene, TmpColors, Vector3 } from "babylonjs";

export default class SettingColorPointersManually {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Setting Color Pointers Manually'
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

    const points = GreasedLineTools.GetCircleLinePoints(2, 400)

    // create color gradient
    const colors: Color3[] = []
    const tmpColor = TmpColors.Color3[0]
    for (let ratio = 0; ratio <= 1; ratio += 0.01) {
      GradientHelper.GetCurrentGradient(
        ratio,
        [
          new Color3Gradient(0, new Color3(1, 0, 0)),
          new Color3Gradient(1, new Color3(1, 1, 1))
        ], (cur, next, scale) => {
          Color3.LerpToRef(cur.color, next.color, scale, tmpColor)
          colors.push(tmpColor.clone())
        }
      )
    }

    // line
    const line = CreateGreasedLine('line', {
      points,
      updatable: true
    }, {
      colors,
      useColors: true,
      width: 0.1,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_SET
    })

    // animate the color pointers
    const colorsCount = line.colorPointers.length / 2

    const newColorPointers: number[] = []
    let cnt = 0
    scene.onBeforeRenderObservable.add(() => {
      newColorPointers.length = 0
      for (let i = 0; i < colorsCount; i++) {
        newColorPointers.push(cnt)
        newColorPointers.push(cnt)
        cnt++
        if (cnt >= colorsCount) cnt = 0
      }
      cnt++
      if (cnt >= colorsCount) cnt = 0
      line.colorPointers = newColorPointers
    })

    return scene;
  }
}