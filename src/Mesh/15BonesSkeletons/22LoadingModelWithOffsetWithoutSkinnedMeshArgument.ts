import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Space, Vector3 } from "babylonjs";

export default class LoadingModelWithOffsetWithoutSkinnedMeshArgument {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Loading Model with Offset with(without) Skinned Mesh Argument'
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

    const mesh = scene.getMeshByName(' / 3')!
    mesh.position = new Vector3(30, 0, 0)

    const box = MeshBuilder.CreateBox('box', { size: 3 })
    const bone = scene.getBoneByName('bone30')!
    scene.registerBeforeRender(() => {
      box.position.copyFrom(bone.getPosition(Space.WORLD, mesh))
      box.rotation.copyFrom(bone.getRotation(Space.WORLD, mesh))
    })

    console.log(meshes.map(m => m.name))

    const skinnedMeshes = meshes.filter(m => m.skeleton == skeletons[0])

    console.log(skinnedMeshes.map(m => m.name))

    return scene;
  }
}