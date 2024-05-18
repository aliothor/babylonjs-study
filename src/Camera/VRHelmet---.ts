import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3, WebVRFreeCamera } from "babylonjs";
import 'babylonjs-loaders';

export default class VRHelmet {
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
    // camera.attachControl(this.canvas, true);
    const camera = new WebVRFreeCamera('camera', new Vector3(0, 2, 0));
    camera.attachControl(true);
    scene.onPointerDown = function () {
      scene.onPointerDown = undefined;
      camera.attachControl(true);
    };

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMesh(
      '',
      'https://www.babylonjs.com/Assets/DamagedHelmet/glTF/',
      'DamagedHelmet.gltf',
      scene,
      (meshes) => {
        console.log(meshes);
      }
    );

    return scene;
  }
}