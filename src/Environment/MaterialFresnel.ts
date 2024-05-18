import { ArcRotateCamera, BackgroundMaterial, Color3, DirectionalLight, Engine, FreeCamera, MeshBuilder, MirrorTexture, Plane, Scene, ShadowGenerator, Texture, Vector3 } from "babylonjs";

export default class MaterialFresnel {
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

    const light = new DirectionalLight('light', new Vector3(-1, -3, 1), scene);
    light.intensity = 0.7;
    light.position = new Vector3(3, 9, 3);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});
    const gMat = new BackgroundMaterial('gMat');
    const texture = new Texture('https://assets.babylonjs.com/environments/backgroundGround.png');
    texture.hasAlpha = true;
    gMat.diffuseTexture = texture;
    gMat.opacityFresnel = false;
    gMat.shadowLevel = 0.2;

    // 反射
    const mirror = new MirrorTexture('mirror', 512);
    mirror.mirrorPlane = new Plane(0, -1, 0, 0);
    mirror.renderList?.push(sphere);
    gMat.reflectionTexture = mirror;
    gMat.reflectionFresnel = true;
    gMat.reflectionStandardFresnelWeight = 0.8;

    // 添加杂色
    gMat.useRGBColor = false;
    gMat.primaryColor = Color3.Magenta();

    ground.material = gMat;
    
    // 添加阴影
    ground.receiveShadows = true;

    const shadowGen = new ShadowGenerator(512, light);
    shadowGen.addShadowCaster(sphere);

    return scene;
  }
}