import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class BakingCurrentTransformation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Baking Current Transformation'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box', {width: 1.5, depth: 1, height: 0.5});
    box.position.y = 1
    box.bakeCurrentTransformIntoVertices()
    box.rotation.z = -Math.PI / 2

    new AxesViewer()

    return scene;
  }
}