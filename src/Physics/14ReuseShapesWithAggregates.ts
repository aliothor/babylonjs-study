import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsMotionType,
  PhysicsShapeType,
  PhysicsViewer,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class ReuseShapesWithAggregates {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Reuse Shapes with Aggregates";
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

    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });

    const mat = new StandardMaterial("mat");
    mat.diffuseColor = Color3.Blue();

    const sphere = MeshBuilder.CreateSphere("sphere");
    sphere.position.set(-2, 2, 0);
    sphere.material = mat;

    const box = MeshBuilder.CreateBox("box");
    box.position.set(0, 2, 0);
    box.material = mat;

    const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 1 });
    cylinder.position.set(2, 2, 0);
    cylinder.material = mat;

    new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 });
    const bag = new PhysicsAggregate(box, sphere.physicsBody?.shape!, {
      mass: 0,
    });
    bag.body.setMassProperties({ mass: 1 }); // not work
    // bag.body.setMotionType(PhysicsMotionType.DYNAMIC);
    new PhysicsAggregate(cylinder, bag.shape, { mass: 1 });

    const viewer = new PhysicsViewer();
    scene.meshes.forEach((m) => {
      if (m.physicsBody) {
        viewer.showBody(m.physicsBody);
      }
    });

    return scene;
  }
}
