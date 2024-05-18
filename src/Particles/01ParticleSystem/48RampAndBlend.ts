import {
  ArcRotateCamera,
  Color3,
  Color4,
  CubeTexture,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  ImageProcessingConfiguration,
  KeyboardEventTypes,
  MeshBuilder,
  PBRMetallicRoughnessMaterial,
  ParticleHelper,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class RampAndBlend {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Ramp and Blend";
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
      300,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

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

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYUP) {
        if (kbInfo.event.key === " ") {
          Explode(
            new Vector3(Math.random() * 300 - 150, 0, Math.random() * 300 - 150)
          );
        }
      }
    });

    function Explode(impact: Vector3) {
      // particle
      const fireBlast = ParticleHelper.CreateDefault(impact, 100);
      // emitter
      fireBlast.createHemisphericEmitter(0.2, 0);
      // emite rate
      fireBlast.emitRate = 5000;
      // Start size
      fireBlast.minSize = 6;
      fireBlast.maxSize = 12;
      // Lifetime
      fireBlast.minLifeTime = 1;
      fireBlast.maxLifeTime = 3;
      // Emission power
      fireBlast.minEmitPower = 30;
      fireBlast.maxEmitPower = 60;
      // Limit velocity over time
      fireBlast.addLimitVelocityGradient(0, 40);
      fireBlast.addLimitVelocityGradient(0.12, 12.983);
      fireBlast.addLimitVelocityGradient(0.445, 1.78);
      fireBlast.addLimitVelocityGradient(0.691, 0.502);
      fireBlast.addLimitVelocityGradient(0.93, 0.05);
      fireBlast.addLimitVelocityGradient(1.0, 0);
      fireBlast.limitVelocityDamping = 0.9;
      // Start rotation
      fireBlast.minInitialRotation = -Math.PI / 2;
      fireBlast.maxInitialRotation = Math.PI / 2;
      // Texture
      fireBlast.particleTexture = new Texture(
        "/Particles/ExplosionSim_Sample.png",
        scene
      );
      fireBlast.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;
      // Color over life
      fireBlast.addColorGradient(0.0, new Color4(1, 1, 1, 0));
      fireBlast.addColorGradient(0.1, new Color4(1, 1, 1, 1));
      fireBlast.addColorGradient(0.9, new Color4(1, 1, 1, 1));
      fireBlast.addColorGradient(1.0, new Color4(1, 1, 1, 0));
      // // Defines the color ramp to apply
      fireBlast.addRampGradient(0.0, new Color3(1, 1, 1));
      fireBlast.addRampGradient(
        0.09,
        new Color3(209 / 255, 204 / 255, 15 / 255)
      );
      fireBlast.addRampGradient(
        0.18,
        new Color3(221 / 255, 120 / 255, 14 / 255)
      );
      fireBlast.addRampGradient(
        0.28,
        new Color3(200 / 255, 43 / 255, 18 / 255)
      );
      fireBlast.addRampGradient(
        0.47,
        new Color3(115 / 255, 22 / 255, 15 / 255)
      );
      fireBlast.addRampGradient(0.88, new Color3(14 / 255, 14 / 255, 14 / 255));
      fireBlast.addRampGradient(1.0, new Color3(14 / 255, 14 / 255, 14 / 255));
      fireBlast.useRampGradients = true;

      // Defines the color remapper over time
      fireBlast.addColorRemapGradient(0, 0, 0.1);
      fireBlast.addColorRemapGradient(0.2, 0.1, 0.8);
      fireBlast.addColorRemapGradient(0.3, 0.2, 0.85);
      fireBlast.addColorRemapGradient(0.35, 0.4, 0.85);
      fireBlast.addColorRemapGradient(0.4, 0.5, 0.9);
      fireBlast.addColorRemapGradient(0.5, 0.95, 1.0);
      fireBlast.addColorRemapGradient(1.0, 0.95, 1.0);
      fireBlast.targetStopDuration = 0.4;
      // Animation update speed
      fireBlast.updateSpeed = 1 / 60;
      // Rendering order
      fireBlast.renderingGroupId = 1;

      fireBlast.start(30);

      fireBlast.disposeOnStop = true;
    }

    return scene;
  }
}
