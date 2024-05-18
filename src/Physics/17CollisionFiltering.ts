import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeSphere,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class CollisionFiltering {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Collision Filtering";
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
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    const ground = MeshBuilder.CreateGround("ground", {
      width: 10,
      height: 10,
    });
    const sphere1 = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
    sphere1.position = new Vector3(-2, 4, 0);
    const sphere2 = sphere1.clone("sphere2");
    sphere2.position = new Vector3(2, 4, 0);

    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      restitution: 1,
    });
    const sag1 = new PhysicsAggregate(sphere1, PhysicsShapeType.SPHERE, {
      mass: 1,
    });
    const sag2 = new PhysicsAggregate(sphere2, PhysicsShapeType.SPHERE, {
      mass: 1,
    });

    const box = MeshBuilder.CreateBox("box", { width: 8, height: 2, depth: 4 });
    const tMat = new StandardMaterial("tMat");
    tMat.diffuseColor = Color3.Red();
    tMat.alpha = 0.8;
    box.material = tMat;
    const bag = new PhysicsAggregate(box, PhysicsShapeType.BOX, {
      mass: 0,
      restitution: 0.8,
    });

    // filter
    const FILTER_GROUP_SPHERE = 1;
    const FILTER_GROUP_GROUND = 2;
    const FILTER_GROUP_BOX = 4;
    sag1.shape.filterMembershipMask = FILTER_GROUP_SPHERE;
    sag2.shape.filterMembershipMask = FILTER_GROUP_SPHERE;
    gag.shape.filterMembershipMask = FILTER_GROUP_GROUND;
    bag.shape.filterMembershipMask = FILTER_GROUP_BOX;

    sag1.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_BOX;
    sag2.shape.filterCollideMask = FILTER_GROUP_GROUND;

    return scene;
  }
}
