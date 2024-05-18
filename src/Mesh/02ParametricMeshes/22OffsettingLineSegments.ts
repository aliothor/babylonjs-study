import { ArcRotateCamera, Color3, CreateGreasedLine, Curve3, Debug, Engine, Scene, Vector3 } from "babylonjs";

export default class OffsettingLineSegments {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Offsetting Line Segments'
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

    const arcPoints = Curve3.ArcThru3Points(
      new Vector3(-9, 4, 4.4),
      new Vector3(9.2, 3.5, -9),
      new Vector3(4.7, -4.8, 5.1),
      40
    ).getPoints()

    const points: Vector3[][] = []
    const colors: Color3[] = []
    for (let i = 0; i < arcPoints.length -1; i++) {
      points.push([arcPoints[i], arcPoints[i + 1]])
      colors.push(Color3.Random())
      colors.push(Color3.Random())
    }

    const line = CreateGreasedLine('line', {
      points,
      updatable: true
    }, {
      useColors: true,
      colors
    })

    // base arc
    const mat2 = line.material?.clone('mat2')
    const line2 = line.clone()
    mat2 ? line2.material = mat2 : ''
    line2.greasedLineMaterial!.useColors = false

    // offset segments
    const offsets = Array(arcPoints.length * 2 * 2 * 3)
    offsets.fill(0)
    let o = 0
    scene.onBeforeRenderObservable.add(() => {
      for (let i = 0; i < arcPoints.length * 2; i++) {
        offsets[i * 6] = Math.sin(i / 12 + o)   // vertex 0 -- x
        offsets[i * 6 + 3] = Math.sin(i / 12 + o) // vertex 1 -- x
      }
      line.offsets = offsets
      o += 0.01 * scene.getAnimationRatio()
    })

    camera.zoomOn([line])
    new Debug.AxesViewer()

    return scene;
  }
}