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

export default class MeshCollidingWithPointCloud {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Mesh Colliding With Point Cloud";
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

    const box = MeshBuilder.CreateBox("box", { size: 0.5 });
    box.position.z = 5;

    const pcs = new PointsCloudSystem("pcs", 1, scene);
    pcs.addPoints(50000, (p: CloudPoint) => {
      p.position = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.velocity = Vector3.Zero();
    });
    await pcs.buildMeshAsync();

    pcs.updateParticle = (p) => {
      if (p.intersectsMesh(box, false)) {
        p.velocity = new Vector3(
          0.01 - 0.02 * Math.random(),
          0.01 - 0.02 * Math.random(),
          -0.05 - 0.01 * Math.random()
        );
      }
      p.position.addInPlace(p.velocity);
      return p;
    };

    scene.registerAfterRender(() => {
      box.position.z -= 0.05;
      pcs.setParticles();
    });

    return scene;
  }
}
