import { ArcRotateCamera, BackgroundMaterial, DirectionalLight, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Texture, Vector3 } from "babylonjs";

export default class MaterialDiffuse {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(-1, -3, 1), scene);
    light.intensity = 0.7;
    light.position = new Vector3(3, 9, 3);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});
    const gMat = new BackgroundMaterial('gMat');
    const texture = new Texture('https://playground.babylonjs.com/textures/grass.jpg');
    texture.uScale = 5;
    texture.vScale = 5;
    gMat.diffuseTexture = texture;
    ground.material = gMat;

    return scene;
  }
}