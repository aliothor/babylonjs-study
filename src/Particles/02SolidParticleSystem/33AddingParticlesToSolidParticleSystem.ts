import {
  ArcRotateCamera,
  Color3,
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

export default class AddingParticlesToSolidParticleSystem {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Adding Particles To a Solid Particle System";
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

    const nb = 60;
    const addNb = 20;
    let areaSize = 150;
    const particleSize = 12;
    camera.setPosition(new Vector3(0, 0, -areaSize * 1.5));

    const box = MeshBuilder.CreateBox("box");
    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 0.5 });
    const sps = new SolidParticleSystem("sps", scene, {
      expandable: true,
      enableDepthSort: true,
    });
    sps.addShape(box, nb / 2);
    sps.addShape(poly, nb / 2);
    box.setEnabled(false);
    poly.setEnabled(false);
    sps.buildMesh();

    const mat = new StandardMaterial("mat");
    mat.diffuseColor = Color3.White();
    mat.alpha = 0.8;
    sps.mesh.material = mat;
    sps.computeParticleTexture = false;

    function initPaticles(start: number, end: number) {
      for (let i = start; i < end; i++) {
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
      }
    }

    initPaticles(0, nb);
    sps.setParticles();

    sps.updateParticle = (p) => {
      p.rotation.x += 0.01;
      p.rotation.y += 0.02;
      p.rotation.z += 0.05;

      p.color = new Color4(
        Math.sin(p.rotation.x),
        Math.cos(p.rotation.y),
        Math.sin(p.rotation.z)
      );
      return p;
    };

    scene.registerBeforeRender(() => {
      sps.mesh.rotation.y += 0.005;
      sps.setParticles();
    });

    // add
    function addParticles(nb: number) {
      const start = sps.nbParticles;
      const n = nb / 2;
      sps.addShape(box, n);
      sps.addShape(poly, n);
      sps.buildMesh();
      initPaticles(start, sps.nbParticles);
      areaSize *= 1.02;
      camera.radius = areaSize * 1.5;
    }

    scene.onPointerDown = () => {
      addParticles(addNb);
    };

    return scene;
  }
}
