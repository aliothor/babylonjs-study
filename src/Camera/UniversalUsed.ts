import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, UniversalCamera, Vector3 } from "babylonjs";

export default class UniversalUsed {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    // const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    const camera = new UniversalCamera('camera', new Vector3(0, 5, -10));
    camera.attachControl(this.canvas, true);
    camera.setTarget(Vector3.Zero());
    camera.inputs.addMouseWheel();

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    return scene;
  }
}