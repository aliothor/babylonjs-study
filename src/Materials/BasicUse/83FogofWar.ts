import { ArcRotateCamera, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class FogofWar {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fog of War'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    // set up scene
    scene.gravity = new Vector3(0, -10, 0)
    scene.collisionsEnabled = true

    const camera = new FreeCamera('camera', new Vector3(0, 1, -10));
    camera.attachControl(this.canvas, true);
    camera.ellipsoid = new Vector3(0.5, 1, 0.5)
    camera.checkCollisions = true
    camera.setTarget(Vector3.Zero())

    const light = new HemisphericLight('light', new Vector3(0, 3, 0), scene);
    light.intensity = 0.7

    const box = MeshBuilder.CreateBox('box');

    return scene;
  }
}