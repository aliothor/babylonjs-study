import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class ExtrudingIrregularPolygons {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extruding Irregular Polygons'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    //Polygon shape in XoZ plane
    const shape = [
      new Vector3(4, 0, -4),
      new Vector3(2, 0, 0),
      new Vector3(5, 0, 2),
      new Vector3(1, 0, 2),
      new Vector3(-5, 0, 5),
      new Vector3(-3, 0, 1),
      new Vector3(-4, 0, -4),
      new Vector3(-2, 0, -3),
      new Vector3(2, 0, -3)
    ];

    //Holes in XoZ plane
    const holes = [];
    holes[0] = [
      new Vector3(1, 0, -1),
      new Vector3(1.5, 0, 0),
      new Vector3(1.4, 0, 1),
      new Vector3(0.5, 0, 1.5)
    ];

    holes[1] = [
      new Vector3(0, 0, -2),
      new Vector3(0.5, 0, -1),
      new Vector3(0.4, 0, 0),
      new Vector3(-1.5, 0, 0.5)
    ];

    const sp = MeshBuilder.CreateLines('sp', { points: shape })
    sp.color = Color3.Magenta()

    const hole1 = MeshBuilder.CreateLines('hole1', { points: holes[0] })
    hole1.color = Color3.Teal()

    const hole2 = MeshBuilder.CreateLines('sp', { points: holes[1] })
    hole2.color = Color3.Yellow()

    const polygon = MeshBuilder.ExtrudePolygon('polygon', {
      shape,
      holes,
      sideOrientation: Mesh.DOUBLESIDE,
      depth: 2
    })

    return scene;
  }
}