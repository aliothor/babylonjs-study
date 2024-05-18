import { ArcRotateCamera, Color3, Engine, FollowCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class FollowUsed {
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

    const camera = new FollowCamera('camera', new Vector3(0, 5, -10));
    camera.attachControl(true);

    camera.radius = 10;
    camera.heightOffset = 10;
    camera.rotationOffset = 60;
    camera.cameraAcceleration = 0.005;
    camera.maxCameraSpeed = 10;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat = new StandardMaterial('mat');
    mat.diffuseColor = Color3.Red();
    const box = MeshBuilder.CreateBox('box');
    box.material = mat;

    const boxX = MeshBuilder.CreateBox('boxX');
    boxX.position = new Vector3(5, 0, 0);
    const boxY = MeshBuilder.CreateBox('boxY');
    boxY.position = new Vector3(0, 5, 0);

    camera.lockedTarget = box;

    setTimeout(() => {
      scene.registerBeforeRender(() => {
        if (box.position.z > -6) {
          box.position.z -= 0.1;
        }
      });
    }, 5000);

    return scene;
  }
}