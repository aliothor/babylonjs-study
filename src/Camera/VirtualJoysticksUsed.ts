import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3, VirtualJoysticksCamera } from "babylonjs";
import 'babylonjs-loaders';

export default class VirtualJoysticksUsed {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    // https://david.blob.core.windows.net/babylonjs/UniversalWebGLGame.zip
    SceneLoader.Load('assets/Espilit/', 'Espilit.babylon', this.engine, (newScene) => {
      const vjc = new VirtualJoysticksCamera('VJC', newScene.activeCamera!.position);
      const actCamera = newScene.activeCamera as ArcRotateCamera;
      vjc.rotation = actCamera.rotation;
      vjc.checkCollisions = actCamera.checkCollisions;
      // vjc.applyGravity = actCamera.grav

      newScene.executeWhenReady(() => {
        newScene.activeCamera = vjc;
        newScene.activeCamera.attachControl(this.canvas);
        this.engine.runRenderLoop(() => {
          newScene.render();
        });
      });
    });

    return scene;
  }
}