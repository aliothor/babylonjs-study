import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, Scene, Vector3 } from "babylonjs";

export default class GreasedLineDashing {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Dashing'
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
      -5, 8, 0,
      5, 8, 0
    ]
    const line1 = CreateGreasedLine('line1', {points: points1}, {
      useDash: true,
      dashCount: 4,
      dashRatio: 0.5,
      color: Color3.Red()
    })

    // 2
    const points2 = [
      -5, 2, 0,
      0, 5, 0,
      5, 2, 0
    ]
    const line2 = CreateGreasedLine('line2', {points: points2}, {
      useDash: true,
      dashCount: 8,
      dashRatio: 0.2,
      color: Color3.Green()
    })

    // 3
    const points3 = [
      -5, -2, 0,
      0, -2, 0,
      5, -2, 0,
      5, -8, 0
    ]
    const widths3 = [4, 4, 1, 1, 1, 1, 4, 4]
    const line3 = CreateGreasedLine('line3', {points: points3, widths: widths3}, {
      useDash: true,
      dashCount: 10,
      dashRatio: 0.5,
      color: Color3.Yellow()
    })

    // animation
    let dashOffset = 0
    scene.onBeforeRenderObservable.add(() => {
      line2.greasedLineMaterial!.dashOffset = dashOffset
      line3.greasedLineMaterial!.dashOffset = dashOffset
      dashOffset += 0.001
      if (dashOffset >= 1) dashOffset = 0
    })

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2, line3])
    
    return scene;
  }
}