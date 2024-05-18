import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Path2, PolygonMeshBuilder, Scene, Vector2, Vector3 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class ExtrudedPolygonsWithHoles {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extruded Polygons With Holes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 25, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const corners = [
      new Vector2(4, -4),
      new Vector2(2, 0),
      new Vector2(5, 2),
      new Vector2(1, 2),
      new Vector2(-5, 5),
      new Vector2(-3, 1),
      new Vector2(-4, -4),
      new Vector2(-2, -3),
      new Vector2(2, -3),
    ];

    const hole = [
      new Vector2(1, -1),
      new Vector2(1.5, 0),
      new Vector2(1.4, 1),
      new Vector2(0.5, 1.5)
    ];

    const shape = MeshBuilder.CreateLines('shape', { points: corners.map(v => new Vector3(v.x, 0, v.y)) })
    shape.color = Color3.Magenta()

    const holeLine = MeshBuilder.CreateLines('hole1', { points: hole.map(v => new Vector3(v.x, 0, v.y)) })
    holeLine.color = Color3.Teal()

    const polyTri1 = new PolygonMeshBuilder('polyTri1', corners)
    polyTri1.addHole(hole)
    const polygon1 = polyTri1.build()
    polygon1.position.y = 4

    const path = new Path2(2, 0)
    path.addLineTo(5, 2)
    path.addLineTo(1, 2)
    path.addLineTo(-5, 5)
    path.addLineTo(-3, 1)
    path.addLineTo(-4, -4)
    path.addArcTo(0, -2, 4, -4, 100)

    const polyTri2 = new PolygonMeshBuilder('polyTri2', path)
    polyTri2.addHole(hole)
    const polygon2 = polyTri2.build(false, 1)
    polygon2.position.y = -4

    return scene;
  }
}