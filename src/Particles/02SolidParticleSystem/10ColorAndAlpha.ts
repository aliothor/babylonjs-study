import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class ColorAndAlpha {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Color And Alpha";
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

    const box = MeshBuilder.CreateBox("box");
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, 2);
    sps.buildMesh();
    box.dispose();

    sps.initParticles = () => {
      sps.particles[0].position = new Vector3(-2, 0, 0);
      sps.particles[1].position = new Vector3(2, 0, 0);

      sps.particles[0].color = new Color4(1, 0, 0, 0.5);
      sps.particles[1].color = new Color4(0.25, 0.333, 0.67, 0.88);
    };

    sps.mesh.hasVertexAlpha = true;

    sps.initParticles();
    sps.setParticles();

    return scene;
  }
}
