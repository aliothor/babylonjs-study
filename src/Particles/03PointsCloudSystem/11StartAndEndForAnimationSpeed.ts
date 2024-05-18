import {
  ArcRotateCamera,
  CloudPoint,
  Color4,
  Engine,
  HemisphericLight,
  PointsCloudSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class StartAndEndForAnimationSpeed {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Start And End For Animation Speed";
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
      3,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const pcs = new PointsCloudSystem("pcs", 1, scene);
    const nb = 10000;
    pcs.addPoints(nb, (p: CloudPoint) => {
      p.position = new Vector3(
        0.5 - Math.random(),
        0.5 - Math.random(),
        0.5 - Math.random()
      );
      p.fixedX = p.position.x;
      p.position.x = p.fixedX + 0.5 * Math.sin(p.position.y * Math.PI * 2);
      p.color = new Color4(
        p.position.y + 0.5,
        p.position.z + 0.5,
        p.position.x + 0.5,
        1
      );
    });
    await pcs.buildMeshAsync();

    let k = 0;
    pcs.updateParticle = (p) => {
      p.position.x = p.fixedX + 0.5 * Math.sin(k + p.position.y * Math.PI * 2);
      return p;
    };

    let invSpeed = 1;
    let p0 = 0;
    let ps = Math.floor(nb / invSpeed) - 1;
    let u = false;
    scene.registerBeforeRender(() => {
      pcs.setParticles(p0, p0 + ps, u);
      p0 = p0 + ps + 1;
      u = false;
      if (p0 >= pcs.nbParticles) {
        p0 = 0;
        k += 0.01;
        u = true;
      }
    });

    return scene;
  }
}
