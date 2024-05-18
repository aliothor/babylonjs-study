import {
  ArcRotateCamera,
  AssetsManager,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class LoadingParticleSystemFromFile {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Loading Particle System From File";
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
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.067, 0.054, 0.157, 1);

    const assetsManager = new AssetsManager(scene);
    const ptcTexture = assetsManager.addTextureTask(
      "my particle texture",
      "/Particles/dotParticle.png"
    );
    const ptcFile = assetsManager.addTextFileTask(
      "my particle system",
      "/Particles/particleSystem.json"
    );

    assetsManager.load();

    assetsManager.onFinish = (tasks) => {
      const ptcJSON = JSON.parse(ptcFile.text);
      const ptcSys = ParticleSystem.Parse(ptcJSON, scene, "", false, 1000);

      ptcSys.particleTexture = ptcTexture.texture;
      ptcSys.emitter = new Vector3(0, 0, 0);
    };

    return scene;
  }
}
