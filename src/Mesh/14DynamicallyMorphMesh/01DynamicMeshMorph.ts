import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class DynamicMeshMorph {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Dynamic Mesh Morph'
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
    pl.intensity = 0.7
    pl.diffuse = Color3.White()
    pl.specular = Color3.Red()

    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.5, 1)
    mat.backFaceCulling = false

    // path function
    function pathFun(k: number) {
      const path: Vector3[] = []
      for (let i = 0; i < 60; i++) {
        path.push(new Vector3(i - 30, 0, k))
      }
      return path
    }

    // ribbon creation
    const pathArray: Vector3[][] = []
    for (let i = -20; i < 20; i++) {
      pathArray.push(pathFun(i * 2))
    }
    let mesh = MeshBuilder.CreateRibbon('mesh', {pathArray, updatable: true, sideOrientation: Mesh.DOUBLESIDE})
    mesh.material = mat

    // update path
    function updatePath(path: Vector3[], t: number) {
      for (let i = 0; i < path.length; i++) {
        path[i].y = 20 * Math.sin(i / 10) * Math.sin(t + path[i].z / 40)
      }
    }

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.03
      for (let p = 0; p < pathArray.length; p++) {
        updatePath(pathArray[p], t)
      }
      mesh = MeshBuilder.CreateRibbon('mesh', {pathArray, instance: mesh})
    })

    return scene;
  }
}