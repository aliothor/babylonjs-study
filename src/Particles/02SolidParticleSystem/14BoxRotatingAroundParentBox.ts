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

export default class BoxRotatingAroundParentBox {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Box Rotating Around a Parent Box";
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
      80,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const particleNb = 2; // 2, 3, 4, 8 自行测试效果
    const areaSize = 10;
    const particleSize = 2;

    const box = MeshBuilder.CreateBox("box");
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, particleNb);
    box.dispose();

    sps.buildMesh();

    sps.updateParticle = (p) => {
      p.position.x = -2;
      p.position.y = 0;
      p.position.z = 0;

      p.scaling.x = particleSize;
      p.scaling.y = particleSize;
      p.scaling.z = particleSize;

      p.color = new Color4(1, 0, 0);

      if (p.idx > 0) {
        p.parentId = p.idx - 1;
        p.position.y = (p.idx / particleNb) * areaSize;
        p.position.x = 0;

        p.color = new Color4(0, p.idx / particleNb, 1 - p.idx / particleNb, 1);
      }

      return p;
    };

    sps.setParticles();

    sps.computeParticleTexture = false;
    sps.computeParticleColor = false;

    let k = 0;
    sps.updateParticle = (p) => {
      if (p.idx == 0) {
        p.position.x = Math.sin(k) * areaSize;
      } else {
        p.rotation.z += 0.02;
      }

      return p;
    };

    scene.registerBeforeRender(() => {
      sps.setParticles();
      k += 0.005;
    });

    return scene;
  }
}
