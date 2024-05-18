import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class FogScene {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000});
    const skyMat = new StandardMaterial('skyMat');
    skyMat.backFaceCulling = false;
    skyMat.reflectionTexture = new CubeTexture(
      'https://playground.babylonjs.com/textures/skybox',
      scene
    );
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMat.diffuseColor = new Color3(0, 0, 0);
    skyMat.specularColor = new Color3(0, 0, 0);
    skybox.material = skyMat;

    const mat = new StandardMaterial('mat');
    mat.diffuseColor = new Color3(1, 1, 0);

    for (let i = 0; i < 10; i++) {
      const box = MeshBuilder.CreateBox('box' + i);
      box.material = mat;
      box.position.z = i * 5;
    }

    // 设置雾
    scene.fogMode = Scene.FOGMODE_EXP;

    scene.fogDensity = 0.001;
    scene.fogColor = new Color3(0.9, 0.9, 0.85);

    let alpha = 0;
    scene.registerBeforeRender(() => {
      scene.fogDensity = Math.cos(alpha) / 10;
      alpha += 0.01;
    });

    return scene;
  }
}