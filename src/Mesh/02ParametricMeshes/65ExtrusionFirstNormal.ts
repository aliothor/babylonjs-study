import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class ExtrusionFirstNormal {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extrusion firstNormal'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const contour = [
      new Vector3(0.5, 0.5, 0),
      new Vector3(0.5, 0, 0),
      new Vector3(-0.5, 0, 0),
      new Vector3(-0.5, 0.5, 0)
    ]
    const pathX = [1, 0, 0, 1]
    const pathY = [0, 0, 2, 2]

    const path0 = []
    const path1 = []

    let pt0 = new Vector3(pathX[0], pathY[0], 0)
    let pt1: Vector3

    const shape = MeshBuilder.CreateLines('shape', { points: contour })
    shape.color = Color3.Teal()

    for (let i = 1; i < pathX.length; i++) {
      path0.push(pt0)
      pt1 = pt0.clone()
      pt1.x += 3
      path1.push(pt1)

      pt0 = new Vector3(pathX[i], pathY[i], 0)
      path0.push(pt0)
      pt1 = pt0.clone()
      pt1.x += 3
      path1.push(pt1)

      MeshBuilder.ExtrudeShape('ext1', {
        shape: contour,
        path: path0,
        sideOrientation: Mesh.DOUBLESIDE
      }).position.x = -6
      MeshBuilder.ExtrudeShape('ext2', {
        shape: contour,
        path: path1,
        sideOrientation: Mesh.DOUBLESIDE,
        firstNormal: new Vector3(0, 0, -1)
      }).position.x = -6

      path0.length = 0
      path1.length = 0
    }

    for (let i = 0; i < pathX.length; i++) {
      path0.push(new Vector3(pathX[i], pathY[i], 0))
      path1.push(new Vector3(pathX[i], pathY[i], 0))
    }
    const path = MeshBuilder.CreateLines('path', {points: path0})
    path.color = Color3.Magenta()

    MeshBuilder.ExtrudeShape('ext1', {
      shape: contour,
      path: path0,
      sideOrientation: Mesh.DOUBLESIDE
    }).position.x = 3
    MeshBuilder.ExtrudeShape('ext2', {
      shape: contour,
      path: path1,
      sideOrientation: Mesh.DOUBLESIDE,
      firstNormal: new Vector3(0, 0, -1)
    }).position.x = 6

    return scene;
  }
}