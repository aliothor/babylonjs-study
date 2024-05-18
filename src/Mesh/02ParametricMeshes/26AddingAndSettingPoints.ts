import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, Scene, Vector3 } from "babylonjs";

export default class AddingAndSettingPoints {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Adding And Setting Points On an Existing Instance'
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

    // 1
    const points1 = [
      -3, 0, 0,
      3, 0, 0
    ]
    const line1 = CreateGreasedLine('line1', {
      points: points1,
      updatable: true
    }, {
      width: 0.1,
      color: Color3.Red()
    })

    setTimeout(() => {
      const toAdd = [
        3, 0, 0,
        3, 3, 0
      ]
      line1.addPoints([toAdd])
      // width
      const newWidth = line1.widths
      const widthsLength = line1.widths.length
      for (let i = toAdd.length / 3 * 2; i > 0; i--) {
        newWidth[widthsLength - i] = 2.5
      }
      line1.widths = newWidth
    }, 1000);

    // 2
    const points2 = [
      -3, 3, 0,
      3, 3, 0
    ]
    const line2 = CreateGreasedLine('line2', {
      points: points2,
      updatable: true
    }, {
      width: 0.1,
      color: Color3.Green()
    })

    setTimeout(() => {
      line2.setPoints([
        [
          -3, 3, 0,
          3, 3, 0
        ],
        [
          3, 3, 0,
          3, 6, 0
        ]
      ])
    }, 2000);

    // 3
    const points3 = [
      -3, 6, 0,
      3, 6, 0
    ]
    const line3 = CreateGreasedLine('line3', {
      points: points3,
      updatable: true
    }, {
      width: 0.1,
      colors: [Color3.Blue()],
      useColors: true
    })

    setTimeout(() => {
      // const colors = line3.greasedLineMaterial?.colors
      // colors?.push(Color3.Yellow())
      // line3.greasedLineMaterial?.setColors(colors, false, true)

      const colors = [...line3.greasedLineMaterial?.colors]
      colors?.push(Color3.Yellow())
      line3.greasedLineMaterial.colors = colors
      const toAdd = [
        3, 6, 0,
        3, 9, 0
      ]
      line3.addPoints([toAdd])
    }, 3000);

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2, line3])


    return scene;
  }
}