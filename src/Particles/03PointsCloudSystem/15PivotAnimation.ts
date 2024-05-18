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

export default class PivotAnimation {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Pivot Animation 2";
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
      Math.PI / 2,
      2,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const pcs1 = new PointsCloudSystem("pcs1", 12, scene);
    pcs1.addPoints(10, (p: CloudPoint, i: number) => {
      p.position = new Vector3(i / 30, i / 30, 0);
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.pivot = Vector3.Zero();
      p.pivot.x = 0.5;
      p.translateFromPivot = true;
    });
    const mesh1 = await pcs1.buildMeshAsync();
    mesh1.position.y = 0.3;

    pcs1.updateParticle = (p) => {
      p.rotation.y += 0.01;
      return p;
    };

    const pcs2 = new PointsCloudSystem("pcs2", 12, scene);
    pcs2.addPoints(10, (p: CloudPoint, i: number) => {
      p.position = new Vector3(i / 30, i / 30, 0);
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.pivot = Vector3.Zero();
      p.pivot.x = 0.5;
    });
    const mesh2 = await pcs2.buildMeshAsync();
    mesh2.position.y = -0.3;

    pcs2.updateParticle = (p) => {
      p.rotation.y += 0.01;
      return p;
    };

    scene.registerBeforeRender(() => {
      pcs1.setParticles();
      pcs2.setParticles();
    });

    return scene;
  }
}
