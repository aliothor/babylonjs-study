import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class AttachingMeshToBone {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Attaching a Mesh To a Bone'
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

    const dude = meshes[0]
    const skeleton = skeletons[0]

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    scene.beginAnimation(skeleton, 0, 120, true, 1.0);

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 8, segments: 8 })
    const sMat = new StandardMaterial('sMaT', scene)
    sMat.diffuseColor = Color3.Red()
    sphere.material = sMat

    sphere.attachToBone(skeleton.bones[34], dude)
    sphere.position.x = 10

    new AxesViewer(scene, 10)

    const axis = new AxesViewer(scene, 10)
    axis.xAxis.attachToBone(skeleton.bones[34], dude)
    axis.yAxis.attachToBone(skeleton.bones[34], dude)
    axis.zAxis.attachToBone(skeleton.bones[34], dude)

    setTimeout(() => {
      dude.scaling = new Vector3(0.5, 0.5, 0.5)
    }, 2000);

    return scene;
  }
}