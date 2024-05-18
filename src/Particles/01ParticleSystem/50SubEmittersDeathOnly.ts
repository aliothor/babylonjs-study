import {
  AbstractMesh,
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  SubEmitter,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class SubEmittersDeathOnly {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Sub Emitters on Death Only";
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
      20,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const url = "https://playground.babylonjs.com/textures/flare.png";
    function createFireworkSubEmitter(
      color: Color4,
      type: number,
      name: string
    ) {
      const pts = new ParticleSystem(name, 2000, scene);
      pts.emitter = new AbstractMesh("");
      pts.particleTexture = new Texture(url);
      if (type == 0) {
        pts.createConeEmitter(2);
      } else if (type == 1) {
        pts.createSphereEmitter(2);
      }
      pts.color1 = color;
      pts.color2 = color;
      pts.colorDead = new Color4(0, 0, 0.2, 0);
      pts.minSize = 0.1;
      pts.maxSize = 0.5;
      pts.minLifeTime = 0.3;
      pts.maxLifeTime = 0.5;
      pts.manualEmitCount = 50;
      pts.disposeOnStop = true;
      pts.blendMode = ParticleSystem.BLENDMODE_ONEONE;
      pts.minAngularSpeed = 0;
      pts.maxAngularSpeed = Math.PI;
      pts.minEmitPower = 5;
      pts.maxEmitPower = 6;
      pts.updateSpeed = 0.005;
      return pts;
    }

    // base particle
    const ptcSys = new ParticleSystem("ptcSys", 2000, scene);
    ptcSys.particleTexture = new Texture(url);
    ptcSys.emitter = new Vector3(0, 0, 0);
    ptcSys.createConeEmitter(1.2);
    ptcSys.color1 = new Color4(1, 0.1, 0.1, 1);
    ptcSys.color2 = new Color4(1, 0.1, 0.1, 1);
    ptcSys.colorDead = new Color4(0.2, 0, 0, 0);
    ptcSys.minSize = 0.1;
    ptcSys.maxSize = 0.5;
    ptcSys.minLifeTime = 0.2;
    ptcSys.maxLifeTime = 0.3;
    ptcSys.emitRate = 2;
    ptcSys.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    ptcSys.minAngularSpeed = 0;
    ptcSys.maxAngularSpeed = Math.PI;
    ptcSys.minEmitPower = 5;
    ptcSys.maxEmitPower = 8;
    ptcSys.updateSpeed = 0.005;

    ptcSys.subEmitters = [
      createFireworkSubEmitter(new Color4(0, 1, 0, 1), 0, "first"),
      createFireworkSubEmitter(new Color4(0, 0, 1, 1), 1, "second"),
    ];

    ptcSys.start();

    return scene;
  }
}
