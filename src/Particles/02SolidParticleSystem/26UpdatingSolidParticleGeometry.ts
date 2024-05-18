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

export default class UpdatingSolidParticleGeometry {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Updating Solid Particle Geometry";
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

    camera.setPosition(new Vector3(0, 50, -100));

    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 8,
      segments: 5,
    });

    const mat = new StandardMaterial("mat");
    mat.bumpTexture = new Texture(
      "https://playground.babylonjs.com/textures/normalMap.jpg"
    );

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(sphere, 60);
    const mesh = sps.buildMesh();
    mesh.material = mat;
    sphere.dispose();

    sps.initParticles = () => {
      const fact = 90;
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position.x = (Math.random() - 0.5) * fact;
        p.position.y = (Math.random() - 0.5) * fact;
        p.position.z = (Math.random() - 0.5) * fact;
        p.rotation.x = Math.random() * 3.2;
        p.rotation.y = Math.random() * 3.2;
        p.rotation.z = Math.random() * 3.2;
        p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      }
    };

    sps.initParticles();
    sps.setParticles();

    sps.updateParticle = (p) => {
      p.rotation.x += p.idx / 5000;
      p.rotation.z += (sps.nbParticles - p.idx) / 1000;

      return p;
    };

    let k = 0;
    let pos = 0;
    sps.updateParticleVertex = (p, vertex, i) => {
      pos = i + k + p.idx / 200;
      if (i < 45) {
        vertex.position.x += Math.sin(pos / 100);
        vertex.position.y += Math.cos(pos / 200);
        vertex.position.z += Math.sin(pos / 300);
      } else {
        vertex.position.x += Math.cos(pos / 100);
        vertex.position.y += Math.sin(pos / 300);
        vertex.position.z += Math.cos(pos / 200);
      }
      vertex.color.r = Math.abs(Math.tan(vertex.position.y * 0.2));

      return sps;
    };
    sps.computeParticleVertex = true;

    const d0 = Date.now();
    scene.registerBeforeRender(() => {
      sps.setParticles();
      mesh.rotation.y += 0.01;
      k = Date.now() - d0;
    });

    return scene;
  }
}
