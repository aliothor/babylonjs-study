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

export default class AddingPointCloudPoints {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Adding Point Cloud Points";
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

    const pcs = new PointsCloudSystem("pcs", 1, scene);
    pcs.addPoints(10000, ptFuc);
    pcs.addPoints(10000, ptFuc);
    const mesh = await pcs.buildMeshAsync();
    mesh.position.y = -1;

    function ptFuc(p: CloudPoint, i: number, s: number) {
      p.position = new Vector3(
        p.groupId * 0.5 + 0.25 * Math.random(),
        i / 5000,
        0.25 * Math.random()
      );
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
    }

    return scene;
  }
}
