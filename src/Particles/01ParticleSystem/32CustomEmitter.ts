import {
  ArcRotateCamera,
  CustomParticleEmitter,
  Engine,
  GPUParticleSystem,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class CustomEmitter {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Custom Emitter";
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

    // emitter object
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 0.1, segments: 6 },
      scene
    );
    sphere.visibility = 0.1;

    let particleSystem: ParticleSystem | GPUParticleSystem;
    let useGPUVersion = true;

    if (useGPUVersion && GPUParticleSystem.IsSupported) {
      particleSystem = new GPUParticleSystem(
        "particle",
        { capacity: 1000000 },
        scene
      );
      particleSystem.maxActiveParticleCount = 200000;
    } else {
      particleSystem = new ParticleSystem("particle", 500000, scene);
    }

    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = sphere;
    particleSystem.minSize = 0.01;
    particleSystem.maxSize = 0.1;
    particleSystem.maxLifeTime = 10;
    particleSystem.emitRate = 10000;

    // emitter type
    const customEmitter = new CustomParticleEmitter();
    let id = 0;
    customEmitter.particlePositionGenerator = (index, particle, out) => {
      out.x = Math.cos(id) * 5;
      out.y = Math.sin(id) * 5;
      out.z = 0;
      id += 0.01;
    };

    customEmitter.particleDestinationGenerator = (index, particle, out) => {
      out.x = 0;
      out.y = 0;
      out.z = 0;
    };

    particleSystem.particleEmitterType = customEmitter;

    particleSystem.start();

    let alpha = 0;
    let moveEmitter = false;
    let rotateEmitter = false;
    scene.registerBeforeRender(() => {
      if (moveEmitter) {
        sphere.position.x = 5 * Math.cos(alpha);
        sphere.position.z = 5 * Math.sin(alpha);
      }
      if (rotateEmitter) {
        sphere.rotation.x += 0.01;
      }

      alpha += 0.01;
    });

    return scene;
  }
}
