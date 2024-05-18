import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointColor,
  PointsCloudSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class StatedColorVolume {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Stated Color of Volume";
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

    const torus = MeshBuilder.CreateTorusKnot("TK");
    const pcs = new PointsCloudSystem("pcs", 2, scene);
    pcs.addVolumePoints(
      torus,
      10000,
      PointColor.Stated,
      new Color4(0, 1, 0, 1),
      0.75
    );
    // pcs.addSurfacePoints(torus, 10000, PointColor.Random);
    await pcs.buildMeshAsync();
    torus.dispose();

    return scene;
  }
}
