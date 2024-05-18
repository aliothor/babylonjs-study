import {
  ArcRotateCamera,
  Color4,
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

export default class SolidParticleColorAndUVs {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particle Color And UVs";
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

    const mat = new StandardMaterial("mat");
    mat.diffuseTexture = new Texture("/Particles/Einstein_tongue.jpg");
    mat.backFaceCulling = false;
    mat.diffuseTexture.hasAlpha = true;
    mat.useAlphaFromDiffuseTexture = true;

    const box = MeshBuilder.CreateBox("box", { size: 5 });
    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 5 });
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, 500);
    sps.addShape(poly, 500);
    box.dispose();
    poly.dispose();
    const mesh = sps.buildMesh();
    mesh.position.y = -50;
    mesh.material = mat;
    camera.setPosition(new Vector3(0, 0, -300));

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        sps.recycleParticle(sps.particles[i]);
      }
    };

    const range = 300;
    sps.recycleParticle = (p) => {
      p.position.x = range * (Math.random() - 0.5);
      p.position.y = range * (Math.random() - 0.5);
      p.position.z = range * (Math.random() - 0.5);

      const scale = Math.random() + 0.5;
      p.scale = new Vector3(scale, scale, scale);

      p.rotation.x = Math.random() * 3.5;
      p.rotation.y = Math.random() * 3.5;
      p.rotation.z = Math.random() * 3.5;

      p.color = new Color4(
        Math.random() * 0.6 + 0.5,
        Math.random() * 0.6 + 0.5,
        Math.random() * 0.6 + 0.5,
        Math.random() * 0.6 + 0.5
      );

      p.uvs.x = Math.random() * 0.5;
      p.uvs.y = Math.random() * 0.5;
      p.uvs.z = Math.random() * 0.5 + 0.5;
      p.uvs.w = Math.random() * 0.5 + 0.5;

      return p;
    };

    sps.initParticles();
    sps.setParticles();

    scene.registerBeforeRender(() => {
      sps.mesh.rotation.y += 0.001;
    });

    return scene;
  }
}