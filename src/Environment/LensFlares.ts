import { ArcRotateCamera, Color3, Engine, HemisphericLight, LensFlare, LensFlareSystem, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders';

export default class LensFlares {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 16, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMesh(
      '',
      'https://playground.babylonjs.com/scenes/',
      'candle.babylon',
      scene,
      (meshes) => {
        scene.createDefaultEnvironment();
        // meshes.forEach(m => console.log(m.name));
        scene.getMeshByName('Plane')!.isVisible = false;
        const lfs = new LensFlareSystem('lfs', scene.getMeshByName('Cylinder_004'), scene);

        const url = 'https://playground.babylonjs.com/textures/';
        const flare0 = new LensFlare(0.1, 1, new Color3(1, 1, 1), url + 'flare.png', lfs);
        const flare1 = new LensFlare(0.15, 1.25, new Color3(0.95, 0.89, 0.72), url + 'flare.png', lfs);
        const flaer2 = new LensFlare(0.1, 0.85, new Color3(0.71, 0.8, 0.95), url + 'Flare2.png', lfs);
        const flare3 = new LensFlare(0.075, 1.5, new Color3(0.8, 0.56, 0.72), url + 'flare3.png', lfs);
      }
    );

    return scene;
  }
}