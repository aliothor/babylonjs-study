import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class PromisesUsed {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');

    SceneLoader.LoadAssetContainerAsync(
      'https://playground.babylonjs.com/scenes/',
      'skull.babylon'
    ).then((container) => {
      container.addAllToScene();
    });

    return scene;
  }
}