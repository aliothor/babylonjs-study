import { ArcRotateCamera, CubeTexture, Engine, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders';

export default class AppendObject {
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

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');

    const url = 'https://playground.babylonjs.com/'
    const hdrTexture = CubeTexture.CreateFromPrefilteredData(`${url}textures/environment.dds`, scene);
    const skybox = scene.createDefaultSkybox(hdrTexture, true);

    // https://playground.babylonjs.com/scenes/BoomBox/BoomBox.gltf
    // https://playground.babylonjs.com/scenes/BoomBox/BoomBox.bin
    // https://playground.babylonjs.com/scenes/BoomBox/BoomBox_normal.png
    // https://playground.babylonjs.com/scenes/BoomBox/BoomBox_emissive.png
    // https://playground.babylonjs.com/scenes/BoomBox/BoomBox_occlusionRoughnessMetallic.png
    SceneLoader.Append(`${url}scenes/BoomBox/`, 'BoomBox.gltf', scene, (scene) => {
      scene.createDefaultCameraOrLight(true, true, true);
      (scene.activeCamera as ArcRotateCamera).alpha += Math.PI;
    });
    // SceneLoader.Load(`ImportingAssets/`, 'box.gltf', this.engine, () => {
    //   console.log('success');
      
    // });
    // SceneLoader.Append(`ImportingAssets/`, 'box.gltf', scene, (scene) => {
    //   console.log('success');
      
    // });


    return scene;
  }
}