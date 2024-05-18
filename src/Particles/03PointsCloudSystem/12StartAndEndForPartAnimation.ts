import {
  ArcRotateCamera,
  CloudPoint,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointsCloudSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class StartAndEndForPartAnimation {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Start And End For Part Animation";
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
        1 - 2 * Math.random(),
        -0.5 * Math.random(),
        0.5 - Math.random()
      );
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.pivot = new Vector3(0, 0, 0);
    });
    pcs.addPoints(nb, (p: CloudPoint) => {
      p.position = new Vector3(
        1 - 2 * Math.random(),
        0.5 * Math.random(),
        0.5 - Math.random()
      );
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.pivot = new Vector3(0, 0, 0);
    });

    await pcs.buildMeshAsync();

    pcs.updateParticle = (p) => {
      p.rotation.y += 0.01;
      return p;
    };

    scene.registerBeforeRender(() => {
      pcs.setParticles(0, nb - 1, true);
    });

    return scene;
  }
}
