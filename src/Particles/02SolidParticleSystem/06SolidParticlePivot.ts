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

export default class SolidParticlePivot {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particle Pivot Example";
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
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const particleNb = 200;
    const half = (particleNb / 2) | 0;
    const box = MeshBuilder.CreateBox("box", { size: 0.05 });
    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 0.05 });

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, particleNb * 0.5);
    sps.addShape(poly, particleNb * 0.5);
    box.dispose();
    poly.dispose();

    const mesh = sps.buildMesh();

    // position and pivot
    const positionX = 1;
    const pivotX = 2;
    const doTranslate = true;

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position.x = 0;
        p.position.y = Math.random() - 0.5;
        p.position.z = 0;

        p.rotation.x = 6.28 * Math.random();
        p.rotation.y = 6.28 * Math.random();
        p.rotation.z = 6.28 * Math.random();

        p.color = new Color4(0, 1, 0, 1);

        if (p.idx >= half) {
          const p0 = sps.particles[p.idx - half];
          p.position.copyFrom(p0.position);
          p.position.x = positionX;

          p.color = new Color4(1, 0, 0, 1);

          p.pivot.x = pivotX;
          p.translateFromPivot = doTranslate;
        }
      }
    };

    sps.initParticles();
    sps.setParticles();

    const pivotAxis = MeshBuilder.CreateBox("pivotAxis", {
      width: 0.01,
      depth: 0.01,
      height: 15,
    });
    const radius = Math.abs(pivotX);
    const shell = MeshBuilder.CreateCylinder("shell", {
      diameter: 2 * radius,
      height: 10,
    });
    shell.visibility = 0.3;

    if (doTranslate) {
      pivotAxis.position.x = positionX;
    } else {
      pivotAxis.position.x = positionX + pivotX;
    }
    shell.position.x = pivotAxis.position.x;

    sps.updateParticle = (p) => {
      p.rotation.y += 0.02;
      return p;
    };
    scene.registerBeforeRender(() => {
      sps.setParticles();
    });

    return scene;
  }
}
