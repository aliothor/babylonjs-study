import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scalar,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
  WebGPUEngine,
} from "babylonjs";

export default class SolidParticleBillboards {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particle Billboards";
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
      50,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const sps = new SolidParticleSystem("sps", scene);
    const plane = MeshBuilder.CreatePlane("plane");
    sps.addShape(plane, 2000);
    plane.dispose();

    const mesh = sps.buildMesh();

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position = new Vector3(
          Scalar.RandomRange(-20, 20),
          Scalar.RandomRange(-20, 20),
          Scalar.RandomRange(-20, 20)
        );
        const row = Math.floor(Scalar.RandomRange(0, 4));
        const col = Math.floor(Scalar.RandomRange(0, 6));
        p.uvs = new Vector4(col / 6, row / 4, (col + 1) / 6, (row + 1) / 4);
      }
    };

    sps.billboard = true;

    sps.initParticles();
    sps.setParticles();

    const mat = new StandardMaterial("mat");
    mat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/spriteAtlas.png"
    );
    // mat.backFaceCulling = false;

    mesh.material = mat;

    scene.registerBeforeRender(() => {
      sps.setParticles();
    });

    return scene;
  }
}
