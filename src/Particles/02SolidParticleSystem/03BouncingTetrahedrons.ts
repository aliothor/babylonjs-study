import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scalar,
  Scene,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class BouncingTetrahedrons {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Bouncing Tetrahedrons";
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
      300,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const sps = new SolidParticleSystem("sps", scene);
    const poly = MeshBuilder.CreatePolyhedron("poly", { type: 0 });
    sps.addShape(poly, 2000);

    poly.dispose();

    const mesh = sps.buildMesh();

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position = new Vector3(
          Scalar.RandomRange(-200, 200),
          Scalar.RandomRange(-200, 200),
          Scalar.RandomRange(-200, 200)
        );
        p.rotation = new Vector3(
          Scalar.RandomRange(-Math.PI, Math.PI),
          Scalar.RandomRange(-Math.PI, Math.PI),
          Scalar.RandomRange(-Math.PI, Math.PI)
        );
        p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
        const angle = Scalar.RandomRange(-Math.PI, Math.PI);
        const range = Scalar.RandomRange(10, 100);
        p.props = { angle, range };
        p.position.y = p.props.range * (1 + Math.cos(p.props.angle));
      }
    };

    sps.initParticles();
    sps.setParticles();

    sps.updateParticle = (p) => {
      p.props.angle += Math.PI / 100;
      p.position.y = p.props.range * (1 + Math.cos(p.props.angle));
      return p;
    };

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 500, height: 500 },
      scene
    );
    ground.position.y = -1;

    let theta = 0;
    scene.registerBeforeRender(() => {
      sps.setParticles();
      theta += Math.PI / 1000;
      mesh.rotation.y = theta;
    });

    return scene;
  }
}
