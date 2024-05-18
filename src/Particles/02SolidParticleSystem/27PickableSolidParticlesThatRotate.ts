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

export default class PickableSolidParticlesThatRotate {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Pickable Solid Particles That Rotate";
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

    const nb = 2000;
    const fact = 50;
    camera.setPosition(new Vector3(0, 10, -100));

    const poly = MeshBuilder.CreatePolyhedron("poly");
    const sps = new SolidParticleSystem("sps", scene, { isPickable: true });
    sps.addShape(poly, nb);
    const mesh = sps.buildMesh();
    poly.dispose();

    sps.updateParticle = (p) => {
      p.position.x = (Math.random() - 0.5) * fact;
      p.position.y = (Math.random() - 0.5) * fact;
      p.position.z = (Math.random() - 0.5) * fact;
      p.rotation.x = Math.random() * 3.14;
      p.rotation.y = Math.random() * 3.14;
      p.rotation.z = Math.random() * 3.14;
      p.color = new Color4(
        p.position.x / fact,
        p.position.y / fact,
        p.position.z / fact,
        1
      );

      return p;
    };

    sps.setParticles();
    sps.refreshVisibleSize();

    sps.computeParticleTexture = false;

    sps.updateParticle = (p) => {
      if (p.props && p.props.picked) {
        p.rotation.x += 0.01;
        p.rotation.y += 0.02;
        p.rotation.z += 0.01;
      }
      return p;
    };

    scene.onPointerDown = (evt, pickInfo, type) => {
      const faceId = pickInfo.faceId;
      if (faceId == -1) return;
      const picked = sps.pickedParticle(pickInfo);
      const idx = picked?.idx ?? -1;
      const p = sps.particles[idx];
      if (!p) return;
      p.color = new Color4(1, 0, 0, 1);
      p.scale = new Vector3(5, 5, 5);
      // sps.setParticles();
      p.props = { picked: true };
    };

    scene.registerBeforeRender(() => {
      sps.setParticles();
      mesh.rotation.y += 0.01;
    });

    return scene;
  }
}
