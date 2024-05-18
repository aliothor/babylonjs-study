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

export default class ScaledPivot {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Scaled Pivot Example";
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

    const particleNb = 2000;
    const half = (particleNb / 2) | 0;
    const box = MeshBuilder.CreateBox("box");
    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 0.5 });

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, particleNb * 0.5);
    sps.addShape(poly, particleNb * 0.5);
    box.dispose();
    poly.dispose();

    const mesh = sps.buildMesh();

    const areaSize = 300;
    const particlesSize = 5;
    camera.setPosition(new Vector3(0, 0, -areaSize));

    sps.updateParticle = (p) => {
      p.position.x = areaSize * (Math.random() - 0.5);
      p.position.y = areaSize * (Math.random() - 0.5);
      p.position.z = areaSize * (Math.random() - 0.5);

      p.rotation.x = 6.28 * Math.random();
      p.rotation.y = 6.28 * Math.random();
      p.rotation.z = 6.28 * Math.random();

      p.color = new Color4(0, 1, 0, 1);
      p.scaling.scaleInPlace(particlesSize);

      if (p.id >= half) {
        const p0 = sps.particles[p.idx - half];
        p.position.copyFrom(p0.position);
        p.scaling.scaleInPlace(particlesSize * 0.1);
        p.color = new Color4(1, 0, 0, 1);
        p.pivot.x = 1.5 * particlesSize;
        p.pivot.y = p.pivot.x;
        p.translateFromPivot = true;
      }
      return p;
    };

    sps.setParticles();
    sps.computeParticleColor = false;
    sps.computeParticleTexture = false;

    sps.updateParticle = (p) => {
      if (p.idx >= half) {
        p.rotation.y += 0.015;
        p.rotation.z -= 0.06;
      } else {
        p.rotation.y += 0.02;
        p.rotation.x += 0.01;
      }
      return p;
    };

    scene.registerBeforeRender(() => {
      sps.setParticles();
      mesh.rotation.y += 0.003;
    });

    return scene;
  }
}
