import {
  ArcRotateCamera,
  Color3,
  Engine,
  GizmoManager,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeCapsule,
  PhysicsShapeCylinder,
  ProximityCastResult,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class ShapeProximity {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Shape Proximity";
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

    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    function buildShape1AndVisualize() {
      const mesh1 = MeshBuilder.CreateCylinder("shape1", { height: 2 });
      mesh1.position.x = -1;
      mesh1.rotationQuaternion = new Quaternion(0, 0, 0, 1);
      const mat = new StandardMaterial("mat1");
      mat.diffuseColor = new Color3(1, 1, 0);
      mesh1.material = mat;

      const shape1 = new PhysicsShapeCylinder(
        new Vector3(0, -1, 0),
        new Vector3(0, 1, 0),
        0.5,
        scene
      );

      return { mesh1, shape1 };
    }

    function buildShape2AndVisualize() {
      const mesh2 = MeshBuilder.CreateCapsule("shape2", {
        radius: 0.5,
        height: 2,
      });
      mesh2.position.x = 1;
      mesh2.rotationQuaternion = new Quaternion(0, 0, 0, 1);
      const mat = new StandardMaterial("mat2");
      mat.diffuseColor = new Color3(0, 0, 1);
      mesh2.material = mat;

      const shape2 = new PhysicsShapeCapsule(
        new Vector3(0, -0.5, 0),
        new Vector3(0, 0.5, 0),
        0.5,
        scene
      );

      const body = new PhysicsBody(
        mesh2,
        PhysicsMotionType.ANIMATED,
        false,
        scene
      );
      body.shape = shape2;
      body.disablePreStep = false;

      return { mesh2, shape2 };
    }

    const { mesh1, shape1 } = buildShape1AndVisualize();
    const { mesh2, shape2 } = buildShape2AndVisualize();

    function buildIndicatorSphere(color: Color3) {
      const sph = MeshBuilder.CreateSphere("sph", { diameter: 0.15 });
      const mat = new StandardMaterial("sm");
      mat.diffuseColor = color;
      sph.material = mat;

      return sph;
    }

    const gizmo = new GizmoManager(scene);
    gizmo.positionGizmoEnabled = true;
    gizmo.rotationGizmoEnabled = true;
    gizmo.attachableMeshes = [mesh1, mesh2];

    const sphereShapeLocal = buildIndicatorSphere(Color3.Red());
    sphereShapeLocal.parent = mesh1;
    const sphereHitWorld = buildIndicatorSphere(Color3.Green());

    const shapeLocalResult = new ProximityCastResult();
    const hitWorldResult = new ProximityCastResult();

    scene.onBeforeRenderObservable.add(() => {
      shapeLocalResult.reset();
      hitWorldResult.reset();

      hk.shapeProximity(
        {
          shape: shape1,
          position: mesh1.absolutePosition,
          rotation: mesh1.absoluteRotationQuaternion,
          maxDistance: 1,
          shouldHitTriggers: false,
        },
        shapeLocalResult,
        hitWorldResult
      );

      if (shapeLocalResult.hasHit && hitWorldResult.hasHit) {
        sphereShapeLocal.position = shapeLocalResult.hitPoint;
        sphereHitWorld.position = hitWorldResult.hitPoint;
      }
    });

    return scene;
  }
}
