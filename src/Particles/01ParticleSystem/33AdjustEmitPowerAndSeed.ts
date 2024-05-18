import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import { GridMaterial } from "babylonjs-materials";

export default class AdjustEmitPowerAndSeed {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Adjust Emit Power And Update Seed";
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

    const ground = MeshBuilder.CreateGround("ground", {
      width: 25,
      height: 25,
    });
    ground.material = new GridMaterial("gMat");
    ground.material.backFaceCulling = false;
    ground.position.y = -0.5;

    const sphere = MeshBuilder.CreateSphere("sphere");

    const ptcSys = new ParticleSystem("ptc", 2000, scene, null, true);
    ptcSys.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/player.png",
      scene,
      true,
      false
    );

    ptcSys.startSpriteCellID = 0;
    ptcSys.endSpriteCellID = 9;
    ptcSys.spriteCellHeight = 64;
    ptcSys.spriteCellWidth = 64;
    ptcSys.spriteCellLoop = true;

    ptcSys.emitter = sphere;
    ptcSys.minEmitBox = new Vector3(-1, 0, -0.3);
    ptcSys.maxEmitBox = new Vector3(0, 0, 0.3);
    ptcSys.minSize = 0.5;
    ptcSys.maxSize = 0.6;
    ptcSys.minLifeTime = 10;
    ptcSys.maxLifeTime = 10;
    ptcSys.emitRate = 2;
    ptcSys.direction1 = new Vector3(-2, 0, 0);
    ptcSys.direction2 = new Vector3(-2, 0, 0);
    ptcSys.minEmitPower = 0.1;
    ptcSys.maxEmitPower = 0.1;
    ptcSys.updateSpeed = 0.1;

    ptcSys.start();

    setTimeout(() => {
      ptcSys.minEmitPower = 1;
      ptcSys.maxEmitPower = 1;
      ptcSys.updateSpeed = 0.01;
      ptcSys.spriteCellChangeSpeed = 30;
    }, 3000);

    return scene;
  }
}
