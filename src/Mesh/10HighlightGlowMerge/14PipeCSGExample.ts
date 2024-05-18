import { ArcRotateCamera, CSG, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Tools, Vector3 } from "babylonjs";

export default class PipeCSGExample {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Pipe CSG Example'
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

    function createPipe(diamInner: number, diamOuter: number, length: number, scene: Scene) {
      // create meshes
      const mOuter = MeshBuilder.CreateCylinder('mOuter', {diameter: diamOuter, height: length})
      const mInner = MeshBuilder.CreateTube('mInner', {path: [new Vector3(0, -length / 2, 0), new Vector3(0, length / 2, 0)], radius: diamInner / 2, sideOrientation: Mesh.DOUBLESIDE})
      // create csg object
      const outerCSG = CSG.FromMesh(mOuter)
      const innerCSG = CSG.FromMesh(mInner)
      // create new csg object
      const pipeCSG = outerCSG.subtract(innerCSG)
      // create new mesh
      const mPipe = pipeCSG.toMesh('mPipe', undefined, scene)
      // dispose source
      mInner.dispose()
      mOuter.dispose()
      scene.removeMesh(mOuter)
      scene.removeMesh(mInner)

      return mPipe
    }

    const pipe = createPipe(0.3, 0.4, 2, scene)
    pipe.rotation.z = Tools.ToRadians(20)

    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.6, 0.9)
    mat.emissiveColor = new Color3(0.1, 0.1, 0.2)
    mat.alpha = 0.2
    pipe.material = mat

    return scene;
  }
}