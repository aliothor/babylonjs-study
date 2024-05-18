import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, MeshBuilder, Path3D, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class SomeMethods {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Path3D Methods'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    new AxesViewer()

    const points = [
      new Vector3(-3, 0, 0),
      new Vector3(2, 0, 0),
      new Vector3(2, 1, 0)
    ]
    const line = MeshBuilder.CreateLines('line', {points})

    const path3d = new Path3D(points)

    // getPointAt
    const plane = MeshBuilder.CreatePlane('plane')
    const adt = AdvancedDynamicTexture.CreateForMesh(plane, 64, 64, false)
    const txt = new TextBlock()
    txt.color = 'white'
    adt.addControl(txt)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.2})
    plane.position.y = 0.3
    plane.parent = sphere

    let percent = 0
    scene.onBeforeRenderObservable.add(() => {
      percent = (percent + 0.001) % 1
      txt.text = percent.toString().substring(0, 4)
      sphere.position = path3d.getPointAt(percent)
    })

    // getPreviousPointIndexAt
    const spherePre = MeshBuilder.CreateSphere('spherePre', {diameter: 0.3})
    spherePre.visibility = 0.5
    spherePre.position = path3d.getCurve()[path3d.getPreviousPointIndexAt(0.5)]
    setTimeout(() => {
      spherePre.position = path3d.getCurve()[path3d.getPreviousPointIndexAt(0.9)]
    }, 3000);
    console.log(path3d.getSubPositionAt(0.5));

    // slice
    const path2 = path3d.slice(0.3, 0.9)
    const p2Line = MeshBuilder.CreateLines('path2', {points: path2.getCurve()})
    p2Line.color = Color3.Red()
    p2Line.position.z = 1

    return scene;
  }
}