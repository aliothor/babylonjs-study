import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class ExtrudedShape {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extruded Shape'
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
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity = 0.7

    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.5, 1)
    mat.backFaceCulling = false

    const shape = [
      new Vector3(1, 0, 0),
      new Vector3(0.2, 0.3, 0),
      new Vector3(0, 1, 0),
      new Vector3(-0.2, 0.3, 0),
      new Vector3(-1, 0, 0),
      new Vector3(-0.2, -0.3, 0),
      new Vector3(0, -1, 0),
      new Vector3(0.2, -0.3, 0)
    ]
    shape.push(shape[0])
    const line = MeshBuilder.CreateLines('line', {points: shape})
    line.color = Color3.Red()

    const path: Vector3[] = []
    for (let i = 0; i < 80; i++) {
      path.push(new Vector3(i - 40, 0, 0))
    }

    let mesh = MeshBuilder.ExtrudeShape('mesh', {shape, path, updatable: true})
    mesh.material = mat

    function updatePath(path: Vector3[], t: number) {
      for (let i = 0; i < path.length; i++) {
        path[i].y = 3 * Math.sin(i / 20) * Math.sin(i / 40 + t)
      }
    }

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.03
      updatePath(path, t)
      mesh = MeshBuilder.ExtrudeShapeCustom('mesh', {shape, path, instance: mesh, rotationFunction: (i, dist) => {
        return Math.abs(Math.sin(t / 60)) / 3
      }})
    })

    return scene;
  }
}