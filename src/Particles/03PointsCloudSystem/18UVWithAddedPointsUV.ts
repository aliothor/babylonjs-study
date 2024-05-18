import {
  ArcRotateCamera,
  CloudPoint,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointsCloudSystem,
  Scene,
  Texture,
  Vector2,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class UVWithAddedPointsUV {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "UV With Added Points UV";
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
      -Math.PI / 4,
      Math.PI / 2.5,
      3,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const pcs = new PointsCloudSystem("pcs", 2, scene);
    pcs.addPoints(5000, (p: CloudPoint) => {
      const sign = Math.sign(0.5 - Math.random());
      const x = 0.5 * sign;
      const y = 0.5 - Math.random();
      const z = 0.5 - Math.random();
      p.position = new Vector3(x, y, z);
      // p.uv = new Vector2(z + 0.5, y + 0.5);
      p.uv = new Vector2((z + 0.5 * sign) * 0.5 + 0.5, y + 0.5);
    });
    const mesh = await pcs.buildMeshAsync();
    mesh.material.emissiveColor = new Color3(0, 0, 0);
    // mesh.material.emissiveTexture = new Texture("/Particles/pig.png");
    mesh.material.emissiveTexture = new Texture("/Particles/zag4.jpeg");
    mesh.material.emissiveTexture.hasVertexAlpha = true;

    return scene;
  }
}
