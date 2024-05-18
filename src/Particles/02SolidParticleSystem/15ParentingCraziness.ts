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

export default class ParentingCraziness {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Parenting Craziness";
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

    scene.clearColor = new Color4(0.1, 0.2, 0.4, 1);

    const particleNb = 2000;
    const areaSize = 20;
    const particleSize = 5;
    const nbPerStem = 20;
    const totalStem = particleNb / nbPerStem;
    camera.setPosition(new Vector3(0, 0, -areaSize * 10));

    const box = MeshBuilder.CreateBox("box");
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, particleNb);
    box.dispose();
    sps.buildMesh();
    sps.mesh.position.y = -areaSize * 1.5;

    const g = 1 / nbPerStem;
    sps.updateParticle = (p) => {
      p.scaling.x = 0.5;
      p.scaling.y = particleSize;
      p.scaling.z = 0.5;

      p.color = new Color4(0, g + (p.idx % nbPerStem) / nbPerStem, 0, 1);

      p.pivot.y = -0.5;
      if (p.idx % nbPerStem == 0) {
        const n = p.idx / nbPerStem;
        p.position.x = (n / totalStem) * 40 - 20;
        p.rotation.z = -p.position.x * 0.08;
      } else {
        p.parentId = p.idx - 1;
        p.position.y = particleSize;
      }
      return p;
    };

    sps.setParticles();

    sps.computeParticleTexture = false;
    sps.computeParticleColor = false;

    const windSpeed = 0.0004;
    let k = 0;
    let sign = 1;
    const limit = windSpeed * 500000;
    sps.updateParticle = (p) => {
      p.rotation.z += sign * windSpeed;

      return p;
    };

    scene.registerBeforeRender(() => {
      sps.setParticles();
      k += 1;
      if (k > limit) {
        k = -limit;
        sign = -sign;
      }
    });

    return scene;
  }
}
