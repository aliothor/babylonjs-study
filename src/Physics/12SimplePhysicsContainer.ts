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
  PhysicsShapeContainer,
  PhysicsShapeSphere,
  PhysicsShapeType,
  PhysicsViewer,
  Quaternion,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class SimplePhysicsContainer {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simple Physics Container";
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

    light.intensity = 0.7;
    const ground = MeshBuilder.CreateGround("ground", {
      width: 10,
      height: 10,
    });
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });

    const result = await SceneLoader.ImportMeshAsync(
      "",
      "https://playground.babylonjs.com/scenes/",
      "skull.babylon"
    );
    const box = result.meshes[0];
    box.position.set(0, 0, 0);
    box.normalizeToUnitCube();

    const nodeParent = new TransformNode("nodeParent");
    nodeParent.position.set(0, 3, 0);
    box.parent = nodeParent;

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.8 });
    sphere.parent = nodeParent;
    sphere.position.set(0, 0.11, 0.05);
    sphere.isVisible = false;

    const cube = MeshBuilder.CreateBox("cube", {
      width: 0.5,
      height: 0.4,
      depth: 0.3,
    });
    cube.parent = nodeParent;
    cube.position.set(0, -0.25, -0.3);
    cube.isVisible = false;

    const sphereShape = new PhysicsShapeSphere(
      new Vector3(0, 0, 0),
      0.4,
      scene
    );
    const cubeShape = new PhysicsShapeBox(
      new Vector3(0, 0, 0),
      Quaternion.Identity(),
      new Vector3(0.5, 0.4, 0.3),
      scene
    );

    const shape = new PhysicsShapeContainer(scene);
    shape.addChildFromParent(nodeParent, sphereShape, sphere);
    shape.addChildFromParent(nodeParent, cubeShape, cube);
    shape.material = { friction: 0.2, restitution: 0 };

    const body = new PhysicsBody(
      nodeParent,
      PhysicsMotionType.DYNAMIC,
      false,
      scene
    );
    body.shape = shape;
    body.setMassProperties({ mass: 1 });

    const viewer = new PhysicsViewer();
    viewer.showBody(body);

    return scene;
  }
}
