import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointsCloudSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class RecyclingAnimations {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Recycling Animations";
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

    const pcs = new PointsCloudSystem("pcs", 2, scene);
    pcs.recycleParticle = (p) => {
      p.position = Vector3.Zero();
      p.color = new Color4(
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      );
      p.velocity = new Vector3(
        0.1 - 0.2 * Math.random(),
        0.05 + 0.05 * Math.random(),
        0.1 - 0.2 * Math.random()
      );
      return p;
    };

    pcs.updateParticle = (p) => {
      if (p.position.y > 4) {
        pcs.recycleParticle(p);
      }
      p.position.addInPlace(p.velocity);
      return p;
    };

    pcs.addPoints(1000, pcs.recycleParticle);
    pcs.buildMeshAsync();

    scene.registerBeforeRender(() => pcs.setParticles());

    return scene;
  }
}
