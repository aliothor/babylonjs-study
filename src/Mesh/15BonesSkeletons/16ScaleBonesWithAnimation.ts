import { ArcRotateCamera, Color3, Debug, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "babylonjs";
import dat from "dat.gui";

export default class ScaleBonesWithAnimation {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Scale Bones with Animation'
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

    const dude = meshes[0]
    const skeleton = skeletons[0]
    const skelViewer = new Debug.SkeletonViewer(skeleton, dude, scene)
    skelViewer.color = Color3.Red()

    const head = skeleton.bones[7]
    const rightBicep = skeleton.bones[13]
    const rightForeArm = skeleton.bones[14]

    scene.registerBeforeRender(() => {
      head.scale(config.headScale, config.headScale, config.headScale, true)
      rightBicep.scale(1, config.bicepScale, config.bicepScale, true)
      rightForeArm.scale(1, config.foreArmScale, config.foreArmScale, true)
    })

    // gui
    const gui = new dat.GUI();
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    const config = {
      headScale: 1,
      bicepScale: 1,
      foreArmScale: 1
    }

    gui.add(config, 'headScale', 0.5, 2, 0.1)
    gui.add(config, 'bicepScale', 0.5, 2, 0.1)
    gui.add(config, 'foreArmScale', 0.5, 2, 0.1)

    return scene;
  }
}