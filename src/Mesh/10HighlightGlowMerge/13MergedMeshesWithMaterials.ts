import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MergedMeshesWithMaterials {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Merged Meshes With Materials'
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
    light.intensity = 0.7

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})

    const box = MeshBuilder.CreateBox('box', {height: 3});
    box.position = new Vector3(1, 1.5, 0)
    const bMat = new StandardMaterial('bMat')
    bMat.diffuseColor = Color3.Green()
    box.material = bMat

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    sphere.position.y = 1
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = Color3.Red()
    sphere.material = sMat

    const m = new Mesh('m')
    m.position.y = 1

    const mesh = Mesh.MergeMeshes([sphere, box], true, false, m, false, true)

    scene.debugLayer.show({embedMode: true})

    return scene;
  }
}