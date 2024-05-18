import {
  ArcRotateCamera,
  Color4,
  CubeTexture,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  ImageProcessingConfiguration,
  MeshBuilder,
  PBRMetallicRoughnessMaterial,
  ParticleHelper,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class RainParticleHelper {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Particle Helper - Rain and Fire";
  }

  async InitScene() {
    const engine = await this.CreateEngine();
    const scene = await this.CreateScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  async CreateEngine(gpu: boolean = false): Promise<Engine> {
    if (gpu) {
      const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        const engine = new WebGPUEngine(this.canvas);
        await engine.initAsync();
        return engine;
      }
    }
    return new Engine(this.canvas);
  }

  async CreateScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      25,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const set = await ParticleHelper.CreateAsync("fire", scene);
    set.start();

    const url = "https://playground.babylonjs.com/textures/";
    const hdrTexture = CubeTexture.CreateFromPrefilteredData(
      url + "Runyon_Canyon_A_2k_cube_specular.dds",
      scene
    );
    hdrTexture.name = "envTex";
    hdrTexture.gammaSpace = false;
    scene.environmentTexture = hdrTexture;

    scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 500, height: 500 },
      scene
    );

    const gMat = new PBRMetallicRoughnessMaterial("gMat");
    gMat.baseTexture = new Texture(url + "rockyGround_basecolor.png");
    gMat.normalTexture = new Texture(url + "rockyGround_normal.png");
    gMat.metallicRoughnessTexture = new Texture(
      url + "rockyGround_metalRough.png"
    );
    gMat.baseTexture.uScale = 40;
    gMat.baseTexture.vScale = 40;
    gMat.normalTexture.uScale = 40;
    gMat.normalTexture.vScale = 40;
    gMat.metallicRoughnessTexture.uScale = 40;
    gMat.metallicRoughnessTexture.vScale = 40;
    gMat.backFaceCulling = false;
    ground.material = gMat;

    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1;

    const pipeline = new DefaultRenderingPipeline("default", true);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;

    return scene;
  }
}
