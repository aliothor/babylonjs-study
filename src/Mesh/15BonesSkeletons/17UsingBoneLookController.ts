import { ArcRotateCamera, BoneLookController, Debug, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class UsingBoneLookController {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using BoneLookController'
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
    scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    camera.maxZ = 500
    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 5 })

    const dude = meshes[0] as Mesh
    const bone = skeletons[0].bones[7]
    const boneViewer = new Debug.BoneAxesViewer(scene, bone, dude, 10)

    const lookAtCtl = new BoneLookController(dude, bone, sphere.position, { adjustYaw: Math.PI / 2, adjustRoll: Math.PI / 2 })

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.02

      sphere.position.x = 120 * Math.sin(t)
      sphere.position.y = 60 + 60 * Math.sin(t * 1.5)
      sphere.position.z = -60
      // sphere.position = new Vector3(120 * Math.sin(t), 60 + 60 * Math.sin(t * 1.5), -60)

      lookAtCtl.update()
      boneViewer.update()
    })

    return scene;
  }
}