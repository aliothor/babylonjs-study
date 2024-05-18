import {
  ArcRotateCamera,
  Color3,
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

export default class SurfaceColorFromMeshColor {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Surface Color from Mesh Color";
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

    const faceColors = [];
    faceColors[0] = Color4.FromColor3(Color3.Blue());
    faceColors[1] = Color4.FromColor3(Color3.Red());
    faceColors[2] = Color4.FromColor3(Color3.Green());
    faceColors[3] = Color4.FromColor3(Color3.Yellow());
    faceColors[4] = Color4.FromColor3(Color3.Purple());
    faceColors[5] = Color4.FromColor3(Color3.White());
    const box = MeshBuilder.CreateBox("box", { faceColors, size: 2 });

    const pcs = new PointsCloudSystem("pcs", 5, scene);
    pcs.addSurfacePoints(box, 10000, PointColor.Color);
    const mesh = pcs.buildMeshAsync();
    box.dispose();

    return scene;
  }
}
