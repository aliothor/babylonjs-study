import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class CollisionObservers {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "BasicScene";
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
    camera.setPosition(new Vector3(0, 10, -20));
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20 },
      scene
    );
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      friction: 0.2,
      restitution: 0.3,
    });

    const cylinder = MeshBuilder.CreateCylinder("cylinder");
    cylinder.position = new Vector3(0, 8, 0);
    const cMat = new StandardMaterial("cMat");
    cMat.diffuseColor = Color3.Blue();
    cylinder.material = cMat;
    new PhysicsAggregate(cylinder, PhysicsShapeType.CYLINDER, { mass: 1 });
    cylinder.physicsBody?.setCollisionCallbackEnabled(true);
    cylinder.physicsBody?.getCollisionObservable().add((ev) => {
      cMat.diffuseColor = Color3.Random();
      console.log(
        ev.type,
        ev.collider.transformNode.name,
        ev.collidedAgainst.transformNode.name
      );
    });

    const box = MeshBuilder.CreateBox("box");
    box.position = new Vector3(2, 8, 0);
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 });
    box.physicsBody?.setCollisionCallbackEnabled(true);

    // hk.onCollisionObservable.add((ev) => {
    //   console.log(
    //     ev.type,
    //     ev.collider.transformNode.name,
    //     ev.collidedAgainst.transformNode.name
    //   );
    // });

    return scene;
  }
}
