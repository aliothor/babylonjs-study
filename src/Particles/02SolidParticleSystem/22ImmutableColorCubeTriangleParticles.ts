import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SolidParticle,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class ImmutableColorCubeTriangleParticles {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Immutable Color Cube and Triangle Particles";
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

    scene.clearColor = Color4.FromColor3(Color3.Black());
    camera.setPosition(new Vector3(0, 0, -200));

    const nb = 160000;
    const fact = 100;
    function positionFun(p: SolidParticle, i: number, s: number) {
      p.position.x = (Math.random() - 0.5) * fact;
      p.position.y = (Math.random() - 0.5) * fact;
      p.position.z = (Math.random() - 0.5) * fact;
      p.rotation.x = Math.random() * 3.14;
      p.rotation.y = Math.random() * 3.14;
      p.rotation.z = Math.random() * 1.5;
      p.color = new Color4(
        p.position.x / fact + 0.5,
        p.position.y / fact + 0.5,
        p.position.z / fact + 0.5,
        1
      );
    }

    const triangle = MeshBuilder.CreateDisc("t", {
      tessellation: 3,
      sideOrientation: Mesh.DOUBLESIDE,
    });

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(triangle, nb, { positionFunction: positionFun });

    const mesh = sps.buildMesh();
    triangle.dispose();

    // mesh.freezeNormals();
    // mesh.freezeWorldMatrix();

    scene.registerBeforeRender(() => {
      mesh.rotation.y += 0.01;
    });

    return scene;
  }
}
