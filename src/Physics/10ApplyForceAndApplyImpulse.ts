import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class ApplyForceAndApplyImpulse {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Apply Force And Apply Impulse";
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
    light.intensity = 0.7;

    camera.setPosition(new Vector3(0, 5, -10));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
    sphere.position.y = 4;
    const ground = MeshBuilder.CreateGround("ground", {
      width: 10,
      height: 10,
    });

    const sag = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {
      mass: 1,
      restitution: 0.75,
    });
    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      restitution: 0.75,
    });

    scene.onPointerDown = () => {
      // sag.body.applyForce(new Vector3(0, 100, 0), sphere.absolutePosition);
      sag.body.applyImpulse(new Vector3(0, 10, 0), sphere.absolutePosition);
    };

    return scene;
  }
}
