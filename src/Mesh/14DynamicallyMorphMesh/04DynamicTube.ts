import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class DynamicTube {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Dynamic Tube'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity= 0.7
    pl.diffuse = Color3.White()
    pl.specular = Color3.Red()

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    // path
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.5, 1)
    mat.backFaceCulling = false

    const path: Vector3[] = []
    for (let i = -20; i < 20; i++) {
      path.push(new Vector3(i * 2, 0, 0))
    }
    let mesh = MeshBuilder.CreateTube('tube', {path, radius: 5, tessellation: 16, updatable: true})
    mesh.material = mat

    // update
    function updatePath(t: number) {
      for (let i = 0; i < path.length; i++) {
        path[i].y = 5 * Math.sin(i / 10 + t * 2)
      }
    }

    let t = 0
    let radius = 5
    scene.registerBeforeRender(() => {
      updatePath(t)
      mesh = MeshBuilder.CreateTube('tube', {path, radius, radiusFunction: (i, dist) => {
        return radius + 2 * Math.sin(i / 2 + t)
      }, instance: mesh})
      t += 0.03
    })

    return scene;
  }
}