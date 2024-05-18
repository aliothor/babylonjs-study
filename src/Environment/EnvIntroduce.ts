import { ArcRotateCamera, Color3, Color4, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class EnvIntroduce {
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
    scene.clearColor = new Color4(0.2, 0.2, 0.3, 1);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    scene.ambientColor = new Color3(0.5, 0.8, 0.5);
    const mat = new StandardMaterial('mat');
    mat.ambientColor = new Color3(0.5, 0.5, 0.3);
    const box = MeshBuilder.CreateBox('box');
    box.material = mat;

    // 自动创建天空盒
    const hdrTexture = new CubeTexture(
      'https://playground.babylonjs.com/textures/SpecularHDR.dds',
      scene
    );
    scene.createDefaultSkybox(hdrTexture, true, 10000);

    return scene;
  }
}