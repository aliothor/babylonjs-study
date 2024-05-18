import { ArcRotateCamera, Color3, CreateGreasedLine, Curve3, Engine, GreasedLineMeshColorDistribution, Scene, Vector3 } from "babylonjs";

export default class GreasedLineCurves {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Curves'
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

    const f = new Vector3(-5 + Math.random(), -5 + Math.random(), -5 + Math.random()).scale(20)
    const s = new Vector3(-5 + Math.random(), -5 + Math.random(), -5 + Math.random()).scale(20)
    const t = new Vector3(-5 + Math.random(), -5 + Math.random(), -5 + Math.random()).scale(20)

    const colors = [Color3.Red(), Color3.Yellow(), Color3.Purple()]
    const points = Curve3.ArcThru3Points(f, s, t).getPoints()
    const line = CreateGreasedLine('arc', {points}, {
      width: 1,
      useColors: true,
      colors,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_REPEAT
    })

    camera.zoomOnFactor = 1.6
    camera.zoomOn([line])

    return scene;
  }
}