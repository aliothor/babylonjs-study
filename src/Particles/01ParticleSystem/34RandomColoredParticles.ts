import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MeshParticleEmitter,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class RandomColoredParticles {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Random Colored Particles";
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

    const particleSystem = new ParticleSystem("particle", 10000, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = Vector3.ZeroReadOnly;
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 1000;

    particleSystem.createSphereEmitter(2);

    particleSystem.start();

    particleSystem.updateFunction = function (particles) {
      // const deltaTime = engine.getDeltaTime() / 1000;
      // const scaledUpdateSpeed = deltaTime * particleSystem.updateSpeed * engine.getFps()
      for (let index = 0; index < particles.length; index++) {
        var particle = particles[index];
        particle.age += this._scaledUpdateSpeed;

        if (particle.age >= particle.lifeTime) {
          // Recycle
          // particles.splice(index, 1);
          // this._stockParticles.push(particle);
          particleSystem.recycleParticle(particle);
          index--;
          continue;
        } else {
          particle.colorStep.scaleToRef(
            this._scaledUpdateSpeed,
            this._scaledColorStep
          );
          particle.color.addInPlace(this._scaledColorStep);

          if (particle.color.a < 0) particle.color.a = 0;

          particle.color = new Color4(
            Math.random(),
            Math.random(),
            Math.random(),
            particle.color.a
          );

          particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;

          particle.direction.scaleToRef(
            this._scaledUpdateSpeed,
            this._scaledDirection
          );
          particle.position.addInPlace(this._scaledDirection);

          this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
          particle.direction.addInPlace(this._scaledGravity);
        }
      }
    };

    return scene;
  }
}
