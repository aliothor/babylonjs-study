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

export default class Triggers {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Triggers";
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
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
    sphere.position.y = 4;

    new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      restitution: 1,
    });
    new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 });

    const triggerSphere = MeshBuilder.CreateSphere("triggerSphere", {
      diameter: 4,
    });
    const tMat = new StandardMaterial("tMat");
    tMat.diffuseColor = Color3.Red();
    tMat.alpha = 0.5;
    triggerSphere.material = tMat;

    const triggerNode = new TransformNode("triggerNode");
    const triggerShape = new PhysicsShapeSphere(new Vector3(0, 0, 0), 2, scene);
    triggerShape.isTrigger = true;
    const triggerBody = new PhysicsBody(
      triggerNode,
      PhysicsMotionType.STATIC,
      false,
      scene
    );
    triggerBody.shape = triggerShape;

    hk.onTriggerCollisionObservable.add((ev) => {
      console.log(
        ev.type,
        ev.collider.transformNode.name,
        ev.collidedAgainst.transformNode.name
      );
    });

    return scene;
  }
}
