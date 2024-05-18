import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class UnderstandingSPSTransparencyIssues {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Understanding SPS Transparency Issues";
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

    const nb = 300;
    const areaSize = 100;
    const particleSize = 12;
    camera.setPosition(new Vector3(0, 0, -areaSize * 2));

    const box = MeshBuilder.CreateBox("box");
    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 0.5 });
    const sps = new SolidParticleSystem("sps", scene, {
      enableDepthSort: true,
    });
    sps.addShape(box, nb * 0.5);
    sps.addShape(poly, nb * 0.5);
    box.dispose();
    poly.dispose();
    const mesh = sps.buildMesh();
    const mat = new StandardMaterial("mat");
    mat.alpha = 0.85;
    mesh.material = mat;

    sps.computeParticleTexture = false;
    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position.x = areaSize * (Math.random() - 0.5);
        p.position.y = areaSize * (Math.random() - 0.5);
        p.position.z = areaSize * (Math.random() - 0.5);
        p.rotation.x = 6.28 * Math.random();
        p.rotation.y = 6.28 * Math.random();
        p.rotation.z = 6.28 * Math.random();
        p.scaling.x = particleSize * Math.random() + 0.5;
        p.scaling.y = particleSize * Math.random() + 0.5;
        p.scaling.z = particleSize * Math.random() + 0.5;
        p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      }
    };

    sps.initParticles();
    sps.setParticles();
    sps.depthSortParticles = false;

    scene.registerBeforeRender(() => {
      sps.setParticles();
    });

    return scene;
  }
}
