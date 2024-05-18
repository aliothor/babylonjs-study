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
  Vector4,
  WebGPUEngine,
} from "babylonjs";

export default class SolidParticlesWithMaterialPerFaceUVsChanged {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particles With Material Per Face UVs Changed";
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

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);

    const mat = new StandardMaterial("mat");
    mat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/spriteAtlas.png"
    );

    const cols = 6;
    const rows = 4;
    const faceUV = new Array<Vector4>(6);

    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows);
      faceUV[i].scaleInPlace(2);
    }
    const box = MeshBuilder.CreateBox("box", {
      width: 10,
      height: 3,
      depth: 5,
      faceUV,
    });

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, 50);
    sps.buildMesh();
    box.dispose();
    sps.mesh.material = mat;

    sps.initParticles = () => {
      const range = 50;
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position.x = range * (0.5 - Math.random());
        p.position.y = range * (0.5 - Math.random());
        p.position.z = range * (0.5 - Math.random());

        p.uvs.z = 0.5;
        p.uvs.w = 0.5;
      }
    };

    sps.initParticles();
    sps.setParticles();

    return scene;
  }
}
