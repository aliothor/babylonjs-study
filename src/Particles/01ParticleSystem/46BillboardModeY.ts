import {
  ArcRotateCamera,
  Color3,
  Color4,
  ConeParticleEmitter,
  Engine,
  GPUParticleSystem,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector2,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class BillboardModeY {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Billboard Mode Y";
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
      5,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0, 0, 0, 1);

    const fountain = MeshBuilder.CreateCylinder("fountain", {
      height: 0.01,
      diameter: 0.2,
    });
    fountain.position.y = 0.5;
    const child = new TransformNode("child");
    child.parent = fountain;
    child.position.y = 1;

    const cup = MeshBuilder.CreateCylinder("cup", { height: 1, diameter: 0.9 });
    const mat = new StandardMaterial("mat");
    mat.diffuseColor = new Color3(0.38, 0.09, 0.03);
    mat.specularColor = Color3.Black();
    cup.material = mat;
    fountain.material = mat;

    const ptcSys = new GPUParticleSystem("ptcSys", { capacity: 30 }, scene);
    ptcSys.particleTexture = new Texture(
      "/Particles/SteamSpriteSheet.png",
      scene,
      true,
      false,
      Texture.TRILINEAR_SAMPLINGMODE
    );
    ptcSys.startSpriteCellID = 0;
    ptcSys.endSpriteCellID = 31;
    ptcSys.spriteCellHeight = 256;
    ptcSys.spriteCellWidth = 128;
    ptcSys.spriteCellChangeSpeed = 4;
    ptcSys.isAnimationSheetEnabled = true;

    ptcSys.emitter = child.position;
    ptcSys.blendMode = ParticleSystem.BLENDMODE_ADD;

    ptcSys.minScaleX = 1;
    ptcSys.maxScaleX = 1;
    ptcSys.minScaleY = 2;
    ptcSys.maxScaleY = 2;

    ptcSys.addSizeGradient(0, 0);
    ptcSys.addSizeGradient(1, 1);

    ptcSys.minLifeTime = 4;
    ptcSys.maxLifeTime = 4;

    ptcSys.emitRate = 6;
    ptcSys.minEmitPower = 0;
    ptcSys.maxEmitPower = 0;
    ptcSys.updateSpeed = 1 / 60;

    ptcSys.translationPivot = new Vector2(0, -0.5);
    ptcSys.particleEmitterType = new ConeParticleEmitter(0.4, Math.PI);

    // color
    ptcSys.addColorGradient(0, new Color4(1, 1, 1, 0));
    ptcSys.addColorGradient(0.5, new Color4(1, 1, 1, 70 / 255));
    ptcSys.addColorGradient(1, new Color4(1, 1, 1, 0));

    ptcSys.billboardMode = ParticleSystem.BILLBOARDMODE_Y;

    ptcSys.start();

    return scene;
  }
}
