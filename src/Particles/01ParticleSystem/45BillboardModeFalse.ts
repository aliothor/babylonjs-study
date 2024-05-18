import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  SphereParticleEmitter,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class BillboardModeFalse {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Billboard Mode False";
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
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const ptcSys = new ParticleSystem("ptcSys", 2000, scene);
    ptcSys.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );
    ptcSys.emitter = new Vector3(0, 0, 0);
    ptcSys.particleEmitterType = new SphereParticleEmitter(5, 0);
    // color
    ptcSys.color1 = new Color4(0.7, 0.8, 1, 1);
    ptcSys.color2 = new Color4(0.2, 0.5, 1, 1);
    ptcSys.colorDead = new Color4(0, 0, 0.2, 0.0);
    // size
    ptcSys.minSize = 0.1;
    ptcSys.maxSize = 0.5;
    // lifetime
    ptcSys.minLifeTime = 5;
    ptcSys.maxLifeTime = 5;
    // emite rate
    ptcSys.emitRate = 1500;
    // speed
    ptcSys.minEmitPower = 0;
    ptcSys.maxEmitPower = 0;
    ptcSys.updateSpeed = 0.005;
    // angular speed
    ptcSys.minAngularSpeed = 0;
    ptcSys.maxAngularSpeed = Math.PI;
    // billoard
    ptcSys.isBillboardBased = false;

    ptcSys.start();

    return scene;
  }
}
