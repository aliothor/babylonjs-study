import { ArcRotateCamera, Axis, Color3, Color4, CreateGreasedLine, Engine, GreasedLineTools, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class RecycleLogo {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Recycle Logo'
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

    scene.clearColor = new Color4(0, 0, 0, 1)

    const segments = 360
    const arrowLength = 40
    const arrowWidth = 3
    const arrowCount = 4
    const arrowGap = 10

    const points = GreasedLineTools.GetCircleLinePoints(20, segments)
    const widths = new Array<number>(segments * 2).fill(1)

    for (let i = 0; i < arrowCount; i++) {
      let start = (segments * 2) / arrowCount * i
      let j = start
      for (let g = 0; g < arrowGap; g++, j++) {
        widths[j] = 0
      }
      for (let w = 0; j < start + arrowLength + arrowGap; j++, w += arrowWidth / arrowLength) {
        widths[j] = w
      }
    }

    const logo = CreateGreasedLine('recycle', {
      points,
      widths
    }, {
      width: 3,
      color: Color3.Green()
    })

    camera.zoomOnFactor = 1.2
    camera.zoomOn([logo])

    scene.onBeforeRenderObservable.add(() => {
      logo.rotate(Axis.Z, -0.01 * scene.getAnimationRatio())
    })

    return scene;
  }
}