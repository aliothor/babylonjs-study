import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, UtilityLayerRenderer, Vector3 } from "babylonjs";

export default class OverlaySceneExample {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Overlay Scene Example'
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
    light.intensity = 0.7

    const box = MeshBuilder.CreateBox('box');

    // const utilLayer = new UtilityLayerRenderer(scene)
    // const utilLayer = UtilityLayerRenderer.DefaultUtilityLayer
    const utilLayer = UtilityLayerRenderer.DefaultKeepDepthUtilityLayer

    // utilLayer.utilityLayerScene.autoClearDepthAndStencil = false

    const overlayBox = MeshBuilder.CreateBox('overlayBox', {}, utilLayer.utilityLayerScene)
    overlayBox.position = new Vector3(0, 0.5, 0.5)

    const overlayLight = new HemisphericLight('overlayLight', new Vector3(0, 0, 1), utilLayer.utilityLayerScene)


    // utilLayer.shouldRender = false;
    // // utilLayer.render();
    // setTimeout(() => {
    //   utilLayer.shouldRender = true
    // }, 2000);

    return scene;
  }
}