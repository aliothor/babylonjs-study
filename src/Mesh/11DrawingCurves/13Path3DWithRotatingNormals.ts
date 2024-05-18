import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, LinesMesh, MeshBuilder, Path3D, Scene, Vector3 } from "babylonjs";

export default class Path3DWithRotatingNormals {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Path3D With Rotating Normals'
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
    let tangents = path3d.getTangents()
    let normals = path3d.getNormals()
    let binormals = path3d.getBinormals()

    const curve = path3d.getCurve()

    // visualisation
    const line = MeshBuilder.CreateLines('line', {points: curve})
    const tg: LinesMesh[] = []
    const no: LinesMesh[] = []
    const bi: LinesMesh[] = []
    for (let p = 0; p < curve.length; p++) {
      tg[p] = MeshBuilder.CreateLines('tg' + p, {points: [curve[p], curve[p].add(tangents[p])], updatable: true})
      tg[p].color = Color3.Red()
      no[p] = MeshBuilder.CreateLines('no' + p, {points: [curve[p], curve[p].add(normals[p])], updatable: true})
      no[p].color = Color3.Blue()
      bi[p] = MeshBuilder.CreateLines('bi' + p, {points: [curve[p], curve[p].add(binormals[p])], updatable: true})
      bi[p].color = Color3.Green()
    }

    let theta = 0
    let newVector = Vector3.Zero()
    scene.registerAfterRender(() => {
      theta += 0.05
      newVector = new Vector3(Math.sin(theta), 0, Math.cos(theta))
      path3d.update(curve, newVector)
      normals = path3d.getNormals()
      binormals = path3d.getBinormals()
        for (let p = 0; p < curve.length; p++) {
        no[p] = MeshBuilder.CreateLines('no' + p, {points: [curve[p], curve[p].add(normals[p])], instance: no[p]})
        bi[p] = MeshBuilder.CreateLines('bi' + p, {points: [curve[p], curve[p].add(binormals[p])], instance: bi[p]})
      }
    })

    return scene;
  }
}