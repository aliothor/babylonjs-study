import { ArcRotateCamera, Color3, CreateGreasedLine, Curve3, Engine, GreasedLineTools, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class GetPositionByVisibility {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Get Position on Line by Visibility'
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

    let visibility = 1
    // 1
    const points1 = GreasedLineTools.ToVector3Array([
      -20, 0, 0,
      0, 4, 0,
      20, 0, 0
    ])
    const line1 = CreateGreasedLine('line1', {points: points1}, {
      visibility: visibility
    })

    // 2
    const f = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const s = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const t = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const points2 = Curve3.ArcThru3Points(f, s, t).getPoints()
    const line2 = CreateGreasedLine('arc', {points: points2}, {
      visibility: visibility
    })

    // marker
    const mat = new StandardMaterial('mat')
    mat.emissiveColor = Color3.Yellow()

    const marker1 = MeshBuilder.CreateSphere('marker1', {diameter: 0.8, segments: 8})
    marker1.material = mat
    const marker2 = MeshBuilder.CreateSphere('marker2', {diameter: 0.8, segments: 8})
    marker2.material = mat

    // info
    const lineSeg1 = GreasedLineTools.GetLineSegments(points1)
    const lineLen1 = GreasedLineTools.GetLineLength(points1)
    const lineSeg2 = GreasedLineTools.GetLineSegments(points2)
    const lineLen2 = GreasedLineTools.GetLineLength(points2)

    // animation
    scene.onBeforeRenderObservable.add(() => {
      marker1.position = GreasedLineTools.GetPositionOnLineByVisibility(lineSeg1, lineLen1, visibility)
      marker2.position = GreasedLineTools.GetPositionOnLineByVisibility(lineSeg2, lineLen2, visibility)

      line1.greasedLineMaterial.visibility = visibility
      line2.greasedLineMaterial.visibility = visibility

      visibility += 0.001 * scene.getAnimationRatio()
      if (visibility >= 1) visibility = 0
    })

    camera.zoomOnFactor = 1.5
    camera.zoomOn([line1, line2])

    return scene;
  }
}