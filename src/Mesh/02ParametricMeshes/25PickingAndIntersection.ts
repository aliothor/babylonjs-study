import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineTools, MeshBuilder, Ray, RayHelper, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class PickingAndIntersection {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Picking And Intersection'
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

    const points = [
      0, 0, 0,
      0, 10, 0,
      3, 10, 0,
      3, 0, 0,
      3.2, 0, 0,
      5, 9, -0.4
    ]
    const subPoints = GreasedLineTools.SegmentizeLineBySegmentLength(GreasedLineTools.ToVector3Array(points), 0.6)
    const allPoints = [
      [...GreasedLineTools.ToNumberArray(subPoints)],
      [
        1, 1, 0,
        1, 9, 0
      ]
    ]
    const line1 = CreateGreasedLine('line1', {points: allPoints}, {
      color: Color3.Red()
    })

    // ray
    const origin = new Vector3(-3, 5, 1)
    const direction = new Vector3(1, 0.4, -0.17)

    const marker = MeshBuilder.CreateSphere('marker', {diameter: 0.2, segments: 8})
    marker.position = origin

    const mat = new StandardMaterial('mat')
    mat.emissiveColor = Color3.Blue()
    mat.disableLighting = true
    marker.material = mat

    const ray = new Ray(origin, direction)
    RayHelper.CreateAndShow(ray, scene, Color3.White())

    // intersection
    line1.intersectionThreshold = 0.7
    const result = line1.findAllIntersections(ray)
    result?.forEach(r => {
      const mk = MeshBuilder.CreateSphere('mk', {diameter: 0.4, segments: 8})
      mk.position = r.point
      mk.material = mat
    })

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1])

    return scene;
  }
}