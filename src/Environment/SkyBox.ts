import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class SkyBox {
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

    

    return scene;
  }
}