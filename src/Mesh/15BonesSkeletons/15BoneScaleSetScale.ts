import { ArcRotateCamera, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class BoneScaleSetScale {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Bone Scale and setScale'
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
    // scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    camera.maxZ = 1000

    const skeleton = skeletons[0]
    const bone = skeleton.bones[2]

    // bone.scaling = new Vector3(2, 2, 2)
    // bone.setScale(new Vector3(2, 2, 2))
    bone.scale(2, 2, 2, true)

    return scene;
  }
}