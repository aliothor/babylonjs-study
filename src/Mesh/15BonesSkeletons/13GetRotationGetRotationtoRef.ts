import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, MeshBuilder, Quaternion, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "babylonjs";

export default class GetRotationGetRotationQuaternion {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'getRotation(ToRef) and getRotationQuaternion(ToRef)'
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

    const box = MeshBuilder.CreateBox('box', { size: 8 })
    const sMat = new StandardMaterial('sMaT', scene)
    sMat.diffuseColor = Color3.Red()
    box.material = sMat

    new AxesViewer(scene, 10)

    const axis = new AxesViewer(scene, 10)
    axis.xAxis.attachToBone(skeleton.bones[34], dude)
    axis.yAxis.attachToBone(skeleton.bones[34], dude)
    axis.zAxis.attachToBone(skeleton.bones[34], dude)

    const bone = skeleton.bones[34]
    box.rotationQuaternion = Quaternion.Identity()
    scene.registerBeforeRender(() => {
      box.position = bone.getPosition(Space.WORLD, dude)
      // box.rotation = bone.getRotation(Space.WORLD, dude)
      // bone.getRotationToRef(Space.WORLD, dude, box.rotation)
      bone.getRotationQuaternionToRef(Space.WORLD, dude, box.rotationQuaternion!)
    })

    return scene;
  }
}