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
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class TetrahedronFountainColorAndTextureNotUpdated {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Tetrahedron Fountain Color And Texture Not Updated";
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
    sps.addShape(poly, 10000);

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

    sps.computeParticleColor = false;
    sps.computeParticleTexture = false;

    let theta = 0;
    scene.registerBeforeRender(() => {
      sps.setParticles();
      theta += Math.PI / 1000;
      mesh.rotation.y = theta;

      fps.text = `FPS: ${engine.getFps().toFixed()}`;
    });

    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const fps = new TextBlock("fps", "30");
    adt.addControl(fps);
    fps.width = "100px";
    fps.height = "50px";
    fps.color = "white";
    fps.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
    fps.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;

    return scene;
  }
}
