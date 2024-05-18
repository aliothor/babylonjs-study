import { ArcRotateCamera, Color3, Engine, HemisphericLight, InputBlock, NodeMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class UsingNodeMaterialWithBones {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Node Material with Bones'
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

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/Dude/', 'Dude.babylon')

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    scene.beginAnimation(skeletons[0], 0, 100, true, 1.0)

    const mat = await NodeMaterial.ParseFromSnippetAsync('#UF4P68')
    meshes.forEach(m => {
      if (m.material) {
        m.material = mat
      }
    })

    const color = mat.getBlockByName('Color3') as InputBlock
    color.value = new Color3(1, 0, 0)

    return scene;
  }
}