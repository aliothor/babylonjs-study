import { BackgroundMaterial, Color3, DirectionalLight, Engine, FreeCamera, MeshBuilder, Scene, ShadowGenerator, Texture, Vector3 } from "babylonjs";

export default class MaterialShadow {
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
    // const texture = new Texture('https://playground.babylonjs.com/textures/grass.jpg');
    // texture.uScale = 5;
    // texture.vScale = 5;
    // gMat.diffuseTexture = texture;
    // gMat.shadowLevel = 0.2;
    gMat.primaryColor = new Color3(0.6, 0, 0);
    gMat.shadowOnly = true;
    ground.material = gMat;

    ground.receiveShadows = true;

    // 添加阴影
    const shadowGen = new ShadowGenerator(512, light);
    shadowGen.addShadowCaster(sphere);

    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.useKernelBlur = true;
    shadowGen.blurKernel = 64;
    shadowGen.blurScale = 4;
    shadowGen.depthScale = 0;

    return scene;
  }
}