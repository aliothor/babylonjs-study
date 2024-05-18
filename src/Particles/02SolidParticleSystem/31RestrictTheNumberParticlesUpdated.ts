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

export default class RestrictTheNumberParticlesUpdated {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Restrict The Number of Particles Updated";
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

    camera.setPosition(new Vector3(0, 30, -30));

    let row = 100;
    let col = 100;
    let nb = row * col;
    const box = MeshBuilder.CreateBox("box", { size: 0.5 });
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, nb);
    sps.buildMesh();
    box.dispose();
    for (let r = 0; r < row; r++) {
      for (let c = 0; c < col; c++) {
        const p = sps.particles[r * col + c];
        p.position.x = c - col * 0.5;
        p.position.z = r - row * 0.5;
      }
    }

    sps.setParticles();

    let k = 0;
    sps.updateParticle = (p) => {
      p.rotation.y = k + p.idx;
      let y = Math.sin(p.rotation.y) * 0.5;
      p.position.y = y;
      p.color = new Color4(
        0.5 + y,
        1 - y,
        0.2 + y,
        (p.rotation.z = p.rotation.y + y)
      );

      return p;
    };

    sps.setParticles();
    sps.computeParticleTexture = false;

    let p0 = 0;
    let ps = 3499;
    let u = false;
    scene.registerBeforeRender(() => {
      // sps.setParticles();
      // k += 0.2;
      sps.setParticles(p0, p0 + ps, u);
      p0 = p0 + ps + 1;
      u = false;
      if (p0 >= nb) {
        p0 = 0;
        u = true;
        k += 0.2;
      }
    });

    return scene;
  }
}
