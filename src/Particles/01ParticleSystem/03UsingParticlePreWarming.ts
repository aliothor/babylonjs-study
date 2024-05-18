import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  SphereParticleEmitter,
  StandardMaterial,
  Texture,
  Vector3,
} from "babylonjs";

export default class UsingParticlePreWarming {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Using Particle Pre-Warming";
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene();

    this.engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      3,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(0, 0, 0);
    const surfaceParticles = new ParticleSystem(
      "surfaceParticles",
      1600,
      scene
    );
    surfaceParticles.particleTexture = new Texture("/Particles/SunSurface.png");

    const coreSphere = MeshBuilder.CreateSphere("coreSphere", {
      diameter: 2.01,
      segments: 64,
    });

    const coreMat = new StandardMaterial("coreMat");
    coreMat.emissiveColor = new Color3(0.3773, 0.093, 0.0266);
    coreSphere.material = coreMat;

    surfaceParticles.preWarmCycles = 100;
    surfaceParticles.preWarmStepOffset = 10;

    surfaceParticles.minInitialRotation = -2 * Math.PI;
    surfaceParticles.maxInitialRotation = 2 * Math.PI;

    const sunEmitter = new SphereParticleEmitter();
    sunEmitter.radius = 1;
    sunEmitter.radiusRange = 0;

    surfaceParticles.emitter = coreSphere;
    surfaceParticles.particleEmitterType = sunEmitter;

    surfaceParticles.addColorGradient(0, new Color4(0.8509, 0.4784, 0.1019, 0));
    surfaceParticles.addColorGradient(
      0.4,
      new Color4(0.6259, 0.3056, 0.0619, 0.5)
    );
    surfaceParticles.addColorGradient(
      0.5,
      new Color4(0.6039, 0.2887, 0.0579, 0.5)
    );
    surfaceParticles.addColorGradient(
      1.0,
      new Color4(0.3207, 0.0713, 0.0075, 0)
    );

    surfaceParticles.minSize = 0.4;
    surfaceParticles.maxSize = 0.7;

    surfaceParticles.minLifeTime = 8;
    surfaceParticles.maxLifeTime = 8;

    surfaceParticles.emitRate = 200;

    surfaceParticles.blendMode = ParticleSystem.BLENDMODE_ADD;

    surfaceParticles.gravity = new Vector3(0, 0, 0);

    surfaceParticles.minAngularSpeed = -0.4;
    surfaceParticles.maxAngularSpeed = 0.4;

    surfaceParticles.minEmitPower = 0;
    surfaceParticles.maxEmitPower = 0;

    surfaceParticles.updateSpeed = 0.005;

    surfaceParticles.isBillboardBased = false;

    surfaceParticles.start();

    return scene;
  }
}
