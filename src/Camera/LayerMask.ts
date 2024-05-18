import { ArcRotateCamera, Camera, Color3, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class GunSight {
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
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box');

    const sphere = MeshBuilder.CreateSphere('sphere');
    sphere.position.x = 3;
    sphere.layerMask = 0x10000000;

    const camera2 = new FreeCamera('camera2', new Vector3(0, 0, -10));
    camera2.layerMask = 0x10000000;

    if (scene.activeCameras?.length === 0) {
      scene.activeCameras.push(scene.activeCamera!);
    }
    scene.activeCameras?.push(camera2);

    // 处理灯光
    for (let i = 0; i < scene.lights.length; i++) {
      scene.lights[i].excludeWithLayerMask = 0x10000000;
    }

    const light2 = new HemisphericLight('light2', new Vector3(0, 1, 0), scene);
    light2.diffuse = Color3.Blue();
    light2.includeOnlyWithLayerMask = 0x10000000;
    

    return scene;
  }
}