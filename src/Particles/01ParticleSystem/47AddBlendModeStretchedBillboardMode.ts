import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  IParticleSystem,
  ImageProcessingConfiguration,
  KeyboardEventTypes,
  MeshBuilder,
  NoiseProceduralTexture,
  ParticleHelper,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class AddBlendModeStretchedBillboardMode {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Add Blend Mode and Stretched Billboard Mode";
  }

  async InitScene() {
    const engine = await this.CreateEngine(true);
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

    scene.clearColor = new Color4(0.005, 0.005, 0.01, 1);
    // emitter
    const fireEmitter = new AbstractMesh("fireEmitter");
    fireEmitter.position = new Vector3(0, -3, 0);
    const fireEmitterLower = new AbstractMesh("fireEmitterLower");
    fireEmitterLower.position = new Vector3(0, -6, 0);
    const fireEmitterHigher = new AbstractMesh("fireEmitterHigher");
    fireEmitterHigher.position = new Vector3(0, -2.5, 0);

    // noise
    const noiseTex1 = new NoiseProceduralTexture("n1", 256);
    noiseTex1.animationSpeedFactor = 5;
    noiseTex1.persistence = 0.2;
    noiseTex1.brightness = 0.5;
    noiseTex1.octaves = 4;

    const noiseTex2 = new NoiseProceduralTexture("n2", 256);
    noiseTex2.animationSpeedFactor = 3;
    noiseTex2.persistence = 1;
    noiseTex2.brightness = 0.5;
    noiseTex2.octaves = 8;

    const noiseTex3 = new NoiseProceduralTexture("n3", 256);
    noiseTex3.animationSpeedFactor = 10;
    noiseTex3.persistence = 2;
    noiseTex3.brightness = 0.5;
    noiseTex3.octaves = 4;

    // particles
    const sparksCore = ParticleHelper.CreateDefault(
      fireEmitter,
      300,
      scene,
      true
    );
    sparksCore.createBoxEmitter(
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(-0.2, 0, -0.2),
      new Vector3(0.2, 0, 0.2)
    );
    sparksCore.particleTexture = new Texture("/Particles/sparkStretched.png");
    sparksCore.minLifeTime = 3;
    sparksCore.maxLifeTime = 3;
    sparksCore.minSize = 0.5;
    sparksCore.maxSize = 0.7;
    sparksCore.emitRate = 100;
    sparksCore.minEmitPower = 1;
    sparksCore.maxEmitPower = 6;
    sparksCore.noiseTexture = noiseTex1;
    sparksCore.noiseStrength = new Vector3(5, 5, 5);
    sparksCore.billboardMode = ParticleSystem.BILLBOARDMODE_STRETCHED;
    sparksCore.blendMode = ParticleSystem.BLENDMODE_ADD;
    colorParticles(sparksCore);
    // sparksCore.start();

    const sparksCoreBurst = ParticleHelper.CreateDefault(
      fireEmitterLower,
      200,
      scene,
      true
    );
    sparksCoreBurst.createBoxEmitter(
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(-0.5, 0, -0.5),
      new Vector3(0.5, 0, 0.5)
    );
    sparksCoreBurst.particleTexture = new Texture("/Particles/sparks.png");
    sparksCoreBurst.minLifeTime = 6;
    sparksCoreBurst.maxLifeTime = 6;
    sparksCoreBurst.minSize = 0.05;
    sparksCoreBurst.maxSize = 0.07;
    sparksCoreBurst.emitRate = 300;
    sparksCoreBurst.minEmitPower = 2;
    sparksCoreBurst.maxEmitPower = 7;
    sparksCoreBurst.noiseTexture = noiseTex3;
    sparksCoreBurst.noiseStrength = new Vector3(5, 1, 1);
    sparksCoreBurst.blendMode = ParticleSystem.BLENDMODE_ADD;
    colorParticles(sparksCoreBurst);
    // sparksCoreBurst.start();

    const sparksEdge = ParticleHelper.CreateDefault(
      fireEmitterHigher,
      200,
      scene,
      true
    );
    sparksEdge.createBoxEmitter(
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(-1, 0, -0.25),
      new Vector3(1, 0, 0.25)
    );
    sparksEdge.particleTexture = new Texture("/Particles/sparks.png");
    sparksEdge.minLifeTime = 5;
    sparksEdge.maxLifeTime = 8;
    sparksEdge.minSize = 0.05;
    sparksEdge.maxSize = 0.07;
    sparksEdge.emitRate = 20;
    sparksEdge.minEmitPower = 1;
    sparksEdge.maxEmitPower = 2;
    sparksEdge.noiseTexture = noiseTex2;
    sparksEdge.noiseStrength = new Vector3(2, 1, 1);
    sparksEdge.blendMode = ParticleSystem.BLENDMODE_ADD;
    colorParticles(sparksEdge);
    // sparksEdge.start();

    const glow = ParticleHelper.CreateDefault(fireEmitter, 20, scene, true);
    glow.particleTexture = new Texture("/Particles/sparks.png");
    glow.minLifeTime = 0.5;
    glow.maxLifeTime = 1;
    glow.emitRate = 10;
    glow.minScaleX = 190;
    glow.maxScaleX = 210;
    glow.minScaleY = 90;
    glow.maxScaleY = 100;
    glow.minEmitPower = 0.2;
    glow.maxEmitPower = 0.4;
    glow.blendMode = ParticleSystem.BLENDMODE_ADD;
    glow.addColorGradient(0, new Color4(0.3113, 0.0367, 0.0367, 0));
    glow.addColorGradient(0.3, new Color4(0.3113, 0.0367, 0.0367, 0.5));
    glow.addColorGradient(1, new Color4(0.3113, 0.0367, 0.0367, 0));
    // glow.start();

    function colorParticles(system: IParticleSystem) {
      system.addColorGradient(0.0, new Color4(0.9245, 0.654, 0.0915, 1));
      system.addColorGradient(0.04, new Color4(0.9062, 0.6132, 0.0942, 1));
      system.addColorGradient(0.4, new Color4(0.7968, 0.3685, 0.1105, 1));
      system.addColorGradient(0.7, new Color4(0.6886, 0.1266, 0.1266, 1));
      system.addColorGradient(0.9, new Color4(0.3113, 0.0367, 0.0367, 1));
      system.addColorGradient(1.0, new Color4(0.3113, 0.0367, 0.0367, 1));

      // Defines the color ramp to apply
      system.addRampGradient(0.0, new Color3(1, 1, 1));
      system.addRampGradient(1.0, new Color3(0.7968, 0.3685, 0.1105));
      system.useRampGradients = true;

      system.addColorRemapGradient(0, 0, 0.1);
      system.addColorRemapGradient(0.2, 0.1, 0.8);
      system.addColorRemapGradient(0.3, 0.2, 0.85);
      system.addColorRemapGradient(0.35, 0.4, 0.85);
      system.addColorRemapGradient(0.4, 0.5, 0.9);
      system.addColorRemapGradient(0.5, 0.95, 1.0);
      system.addColorRemapGradient(1.0, 0.95, 1.0);
    }

    // keyboard
    let play = false;
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYUP && kbInfo.event.key == " ") {
        play = !play;
        if (play) {
          sparksCore.start();
          sparksCoreBurst.start();
          sparksEdge.start();
          glow.start();
        } else {
          sparksCore.stop();
          sparksCoreBurst.stop();
          sparksEdge.stop();
          glow.stop();
        }
      }
    });

    // render pipeline
    const pipeline = new DefaultRenderingPipeline("default", true);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.1;
    pipeline.bloomWeight = 3;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;

    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 3;

    let delta = 0;
    scene.registerBeforeRender(() => {
      fireEmitter.position = new Vector3(
        Math.sin(delta) * 0.4,
        fireEmitter.position.y,
        0
      );
      fireEmitter.rotation = new Vector3(
        Math.sin(delta) * 0.5,
        fireEmitter.position.y,
        0
      );
      fireEmitterLower.position = new Vector3(
        Math.cos(delta) * 0.5,
        fireEmitter.position.y,
        0
      );
      delta += 0.1;
    });

    return scene;
  }
}
