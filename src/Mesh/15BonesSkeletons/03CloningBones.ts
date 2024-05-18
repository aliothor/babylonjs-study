import { ArcRotateCamera, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CloningBones {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Cloning Bones'
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

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('Rabbit', 'https://playground.babylonjs.com/scenes/', 'Rabbit.babylon')

    const rabbit = meshes[1]

    const rabbit2 = rabbit.clone('rabbit2', null)!
    rabbit2.position = new Vector3(-50, 0, -20)
    rabbit2.skeleton = rabbit.skeleton!.clone('rabbit2Skeleton')

    const rabbit3 = rabbit.clone('rabbit3', null)!
    rabbit3.position = new Vector3(50, 0, -20)
    rabbit3.skeleton = rabbit.skeleton!.clone('rabbit3Skeleton')

    camera.zoomOnFactor = 1.5
    camera.zoomOn([rabbit, rabbit2, rabbit3])
    camera.maxZ = 500

    scene.beginAnimation(skeletons[0], 0, 100, true, 0.8)
    scene.beginAnimation(rabbit2.skeleton, 73, 100, true, 0.8)
    scene.beginAnimation(rabbit3.skeleton, 0, 72, true, 0.8)

    return scene;
  }
}