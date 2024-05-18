import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Path3D, Scene, Vector3 } from "babylonjs";

export default class TangentsNormalsBinormals {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Tangents Normals and Binormals'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 50, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    const points = []
    for (let i = 0; i < 50; i++) {
      // points.push(new Vector3(i - 25, 5 * Math.sin(i / 2), 0))
      points.push(new Vector3(i - 25, 5 * Math.sin(i / 2), i / 5 * Math.cos(i / 2)))
    }

    // Path3D
    const path3d = new Path3D(points)
    const tangents = path3d.getTangents()
    const normals = path3d.getNormals()
    const binormals = path3d.getBinormals()

    const curve = path3d.getCurve()

    // visualisation
    const line = MeshBuilder.CreateLines('line', {points: curve})
    for (let p = 0; p < curve.length; p++) {
      const tg = MeshBuilder.CreateLines('tg' + p, {points: [curve[p], curve[p].add(tangents[p])]})
      tg.color = Color3.Red()
      const no = MeshBuilder.CreateLines('no' + p, {points: [curve[p], curve[p].add(normals[p])]})
      no.color = Color3.Blue()
      const bi = MeshBuilder.CreateLines('bi' + p, {points: [curve[p], curve[p].add(binormals[p])]})
      bi.color = Color3.Green()
    }

    return scene;
  }
}