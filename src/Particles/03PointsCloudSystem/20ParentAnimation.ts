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

export default class ParentAnimation {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Parent Animation";
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
      2,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const pcs = new PointsCloudSystem("pcs", 5, scene);
    pcs.addPoints(100, (p: CloudPoint) => {
      p.color = new Color4(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      );
      if (p.idx > 0) {
        p.parentId = p.idx - 1;
      }
      p.position = new Vector3(0.01, 0.008, 0.01);
    });
    await pcs.buildMeshAsync();

    pcs.updateParticle = (p) => {
      p.rotation.y += 0.005;
      return p;
    };

    scene.registerAfterRender(() => pcs.setParticles());

    return scene;
  }
}
