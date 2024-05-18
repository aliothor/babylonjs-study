import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, Scene, SceneLoader, Space, Vector3 } from "babylonjs";

export default class TranslateExample {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Translate and setPosition'
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

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/Dude/', 'Dude.babylon')

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    // scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    new AxesViewer(scene, 10)

    const dude = meshes[0]
    const skeleton = skeletons[0]
    const bone6 = skeleton.bones[6]
    const bone7 = skeleton.bones[7]

    const axisBone6 = new AxesViewer(scene, 10)
    axisBone6.xAxis.attachToBone(bone6, dude)
    axisBone6.yAxis.attachToBone(bone6, dude)
    axisBone6.zAxis.attachToBone(bone6, dude)

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.1
      // 1
      // bone7.translate(new Vector3(Math.sin(t) * 0.05, Math.sin(t) * 0.05, 0), Space.LOCAL, dude)

      // 2
      // bone7.setPosition(new Vector3(Math.cos(t), 65, Math.sin(t)), Space.WORLD, dude)
      // bone7.setAbsolutePosition(new Vector3(Math.cos(t), 65, Math.sin(t)), dude)

      // 3
      bone7.setAbsolutePosition(new Vector3(0, 65, 0), dude)
      dude.position.x = Math.sin(t)
    })

    return scene;
  }
}