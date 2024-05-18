import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class SolidParticlesWithUVsSet {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particles With UVs Set";
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
      4,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const mat = new StandardMaterial("mat");
    mat.diffuseTexture = new Texture(
      "https://playground.babylonjs.com/textures/mercator.jpg"
    );

    const plane = MeshBuilder.CreatePlane(
      "plane",
      { width: 2, height: 1 },
      scene
    );
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(plane, 4);
    sps.buildMesh();
    plane.dispose();
    sps.mesh.material = mat;

    sps.initParticles = () => {
      sps.particles[0].position = new Vector3(-1.2, 0.8, 0);
      sps.particles[1].position = new Vector3(1.2, 0.8, 0);
      sps.particles[2].position = new Vector3(-1.2, -0.8, 0);
      sps.particles[3].position = new Vector3(1.2, -0.8, 0);

      sps.particles[0].uvs.x = 0.2;
      sps.particles[1].uvs.y = 0.1;
      sps.particles[2].uvs.z = 0.3;
      sps.particles[3].uvs.w = 0.6;
    };

    sps.initParticles();
    sps.setParticles();

    return scene;
  }
}
