import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsShapeType,
  Quaternion,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class SetTargetTransform {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "SetTargetTransform";
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

    camera.setPosition(new Vector3(0, 5, -10));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const box = MeshBuilder.CreateBox("box", { width: 3, height: 1, depth: 1 });
    box.rotationQuaternion = Quaternion.Identity();
    const boxShape = new PhysicsShapeBox(
      new Vector3(0, 0, 0),
      Quaternion.Identity(),
      new Vector3(3, 1, 1),
      scene
    );
    const boxBody = new PhysicsBody(
      box,
      PhysicsMotionType.ANIMATED,
      false,
      scene
    );
    boxBody.shape = boxShape;

    const amountToRate = 0.005;
    const spawnInterval = 100;
    let frameCount = 0;
    scene.onBeforeRenderObservable.add(() => {
      const currRot = box.rotationQuaternion!;
      const amountToRotateQuat = Quaternion.FromEulerAngles(0, 0, amountToRate);
      currRot.multiplyInPlace(amountToRotateQuat);

      boxBody.setTargetTransform(box.absolutePosition, currRot);

      if (frameCount++ % spawnInterval == 0) {
        const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.5 });
        ball.position.y = 2;
        new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, {
          mass: 100,
          startAsleep: false,
        });
      }
    });

    return scene;
  }
}
