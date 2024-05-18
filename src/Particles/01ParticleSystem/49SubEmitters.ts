import {
  AbstractMesh,
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  ParticleSystem,
  Scene,
  SubEmitter,
  SubEmitterType,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class SubEmitters {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Sub Emitters";
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

    const url = "https://playground.babylonjs.com/textures/flare.png";
    // sub emitter
    const subEmitter1 = new SubEmitter(new ParticleSystem("sub1", 300, scene));
    subEmitter1.particleSystem.particleTexture = new Texture(url);
    subEmitter1.particleSystem.emitter = new AbstractMesh("");
    subEmitter1.particleSystem.createDirectedCylinderEmitter(0.1, 0, 0);
    subEmitter1.particleSystem.minEmitBox = new Vector3(0, 0, 0);
    subEmitter1.particleSystem.maxEmitBox = new Vector3(0, 0, 0);
    subEmitter1.particleSystem.minSize = 0.1;
    subEmitter1.particleSystem.maxSize = 0.1;
    subEmitter1.particleSystem.addColorGradient(0, new Color4(0, 1, 0, 0));
    subEmitter1.particleSystem.addColorGradient(0.5, new Color4(1, 0, 0, 1));
    subEmitter1.type = SubEmitterType.ATTACHED;
    subEmitter1.inheritDirection = true;
    subEmitter1.inheritedVelocityAmount = 1;

    const subEitter2 = new SubEmitter(new ParticleSystem("sub2", 50, scene));
    subEitter2.particleSystem.particleTexture = new Texture(url);
    subEitter2.particleSystem.emitter = new AbstractMesh("");
    subEitter2.particleSystem.minEmitBox = new Vector3(0, 0, 0);
    subEitter2.particleSystem.maxEmitBox = new Vector3(0, 0, 0);
    subEitter2.particleSystem.minEmitPower = -10;
    subEitter2.particleSystem.maxEmitPower = -10;
    subEitter2.particleSystem.minSize = 0.1;
    subEitter2.particleSystem.maxSize = 0.1;
    subEitter2.particleSystem.addColorGradient(0, new Color4(0, 1, 1, 0));
    subEitter2.particleSystem.addColorGradient(0.5, new Color4(1, 1, 0, 1));
    subEitter2.particleSystem.direction1 = new Vector3(0, 1, 0);
    subEitter2.particleSystem.direction2 = new Vector3(0, 1, 0);
    subEitter2.type = SubEmitterType.ATTACHED;
    subEitter2.inheritDirection = true;

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

      const se = new SubEmitter(pts);
      se.inheritDirection = true;
      return se;
    }

    // particle base
    const ptcSys = new ParticleSystem("ptcSys", 2000, scene);
    ptcSys.particleTexture = new Texture(url);
    ptcSys.emitter = new Vector3(0, 0, 0);
    ptcSys.color1 = new Color4(1, 0.1, 0.1, 1);
    ptcSys.color2 = new Color4(1, 0.1, 0.1, 1);
    ptcSys.colorDead = new Color4(0.2, 0, 0, 0);
    ptcSys.minSize = 0.2;
    ptcSys.maxSize = 0.2;
    ptcSys.minLifeTime = 0.9;
    ptcSys.maxLifeTime = 0.9;
    ptcSys.emitRate = 30;
    ptcSys.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    ptcSys.minAngularSpeed = 0;
    ptcSys.maxAngularSpeed = Math.PI;
    ptcSys.minEmitPower = 5;
    ptcSys.maxEmitPower = 5;
    ptcSys.updateSpeed = 0.005;
    ptcSys.direction1 = new Vector3(0.5, 0.5, 0.5).normalize();
    ptcSys.direction2 = new Vector3(-0.5, 0.5, -0.5).normalize();
    ptcSys.minEmitBox = new Vector3(0, 0, 0);
    ptcSys.maxEmitBox = new Vector3(0, 0, 0);

    ptcSys.subEmitters = [
      [
        subEmitter1,
        subEitter2,
        createFireworkSubEmitter(new Color4(0, 1, 0, 1), 0, "first"),
      ],
      [
        subEmitter1,
        subEitter2,
        createFireworkSubEmitter(new Color4(0, 0, 1, 1), 1, "second"),
      ],
    ];
    // ptcSys.start();

    scene.onKeyboardObservable.add((knInfo) => {
      if (knInfo.type == KeyboardEventTypes.KEYUP && knInfo.event.key == " ") {
        ptcSys.isStarted() ? ptcSys.stop() : ptcSys.start();
      }
    });

    return scene;
  }
}
