import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scalar,
  Scene,
  SolidParticle,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class FountainRecycledTetrahedrons {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "A Fountain of Recycled Tetrahedrons";
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
      200,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const sps = new SolidParticleSystem("sps", scene);
    const poly = MeshBuilder.CreatePolyhedron("poly", { type: 0 });
    sps.addShape(poly, 1000);

    poly.dispose();

    const mesh = sps.buildMesh();

    const speed = 1.5;
    const gravity = -0.01;

    function recycleParticle(p: SolidParticle) {
      p.position = Vector3.Zero();
      p.rotation = new Vector3(
        Scalar.RandomRange(-Math.PI, Math.PI),
        Scalar.RandomRange(-Math.PI, Math.PI),
        Scalar.RandomRange(-Math.PI, Math.PI)
      );
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      p.velocity = new Vector3(
        Scalar.RandomRange(-0.5 * speed, 0.5 * speed),
        Scalar.RandomRange(0.25 * speed, speed),
        Scalar.RandomRange(-0.5 * speed, 0.5 * speed)
      );
    }

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        recycleParticle(sps.particles[i]);
      }
    };

    sps.initParticles();
    sps.setParticles();

    sps.updateParticle = (p) => {
      if (p.position.y < 0) {
        recycleParticle(p);
      }
      p.velocity.y += gravity;
      p.position.addInPlace(p.velocity);

      const dir = Math.sin((p.idx % 2) - 0.5);
      p.rotation.x += 0.05 * dir;
      p.rotation.y += 0.008 * dir;
      p.rotation.z += 0.1 * dir;
      return p;
    };

    let theta = 0;
    scene.registerBeforeRender(() => {
      sps.setParticles();
      theta += Math.PI / 1000;
      mesh.rotation.y = theta;
    });

    return scene;
  }
}
