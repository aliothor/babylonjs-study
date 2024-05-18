import { ArcRotateCamera, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class PickingMeshAttachedToSkeleton {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Picking a Mesh Attached to a Skeleton'
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

    meshes[0].position = new Vector3(0, 0, 5)

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);
    camera.radius = 200
    camera.maxZ = 1000

    for (let i = 0; i < 10; i++) {
      const xrand = Math.floor(Math.random() * 500) - 250
      const zrand = Math.floor(Math.random() * 500) - 250

      const c = []
      const speed = 0.5 + Math.random()
      for (let j = 0; j < meshes.length; j++) {
        c[j] = meshes[j].clone(`c-${i}-${j}`, null, true)!
        c[j].position = new Vector3(xrand, 0, zrand)
        if (c[j].skeleton) {
          c[j].skeleton = meshes[j].skeleton!.clone('skeleton_' + j)
          scene.beginAnimation(c[j].skeleton, 0, 120, true, speed)
        }
      }
    }

    scene.onPointerDown = () => {
      scene.meshes.forEach((m) => m.refreshBoundingInfo(true))
      const pickResult = scene.pick(scene.pointerX, scene.pointerY)
      if (pickResult.hit) {
        console.log(pickResult.pickedMesh?.skeleton?.name)
      }
    }

    return scene;
  }
}