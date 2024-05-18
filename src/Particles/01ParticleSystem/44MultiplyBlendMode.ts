import {
  ArcRotateCamera,
  Color4,
  CubeTexture,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleHelper,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "babylonjs";

export default class MultiplyBlendMode {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Multiply Blend Mode";
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
      25,
      new Vector3(0, 8, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const hdrTex = CubeTexture.CreateFromPrefilteredData(
      "/Particles/Runyon_Canyon_A_2k_cube_specular.dds",
      scene
    );
    hdrTex.name = "envTex";
    hdrTex.gammaSpace = false;

    scene.environmentTexture = hdrTex;
    scene.clearColor = new Color4(0.3, 0.3, 0.3, 1);

    // particle system
    const smokePillar = ParticleHelper.CreateDefault(Vector3.Zero(), 2000);
    const smokePillarCone = smokePillar.createConeEmitter(0.6, 1);
    smokePillar.emitRate = 20;
    // size
    smokePillar.addSizeGradient(0, 1, 2);
    smokePillar.addSizeGradient(1, 5, 8);
    // lifetime
    smokePillar.minLifeTime = 5;
    smokePillar.maxLifeTime = 8;
    // rotation
    smokePillar.minInitialRotation = -Math.PI / 2;
    smokePillar.maxInitialRotation = Math.PI / 2;
    // rotation over lifetime
    smokePillar.addAngularSpeedGradient(0, 0);
    smokePillar.addAngularSpeedGradient(1, -0.4, 0.4);
    // texture
    smokePillar.particleTexture = new Texture(
      "/Particles/CloudSpriteSheet.png"
    );
    smokePillar.spriteCellWidth = 256;
    smokePillar.spriteCellHeight = 256;
    smokePillar.startSpriteCellID = Math.floor(Math.random() * 4);
    smokePillar.endSpriteCellID = Math.floor(Math.random() * 4);
    smokePillar.isAnimationSheetEnabled = true;
    smokePillar.spriteCellChangeSpeed = 1;

    smokePillar.blendMode = ParticleSystem.BLENDMODE_MULTIPLY;
    // color
    smokePillar.addColorGradient(
      0,
      new Color4(190 / 255, 180 / 255, 180 / 255, 0)
    );
    smokePillar.addColorGradient(
      0.2,
      new Color4(190 / 255, 180 / 255, 180 / 255, 128 / 255)
    );
    smokePillar.addColorGradient(
      0.6,
      new Color4(110 / 255, 100 / 255, 100 / 255, 60 / 255)
    );
    smokePillar.addColorGradient(
      1,
      new Color4(110 / 255, 100 / 255, 100 / 255, 0)
    );

    smokePillar.preWarmCycles = 500;

    smokePillar.start();

    return scene;
  }
}
