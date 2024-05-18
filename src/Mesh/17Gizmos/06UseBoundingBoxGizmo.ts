import {
  ArcRotateCamera,
  BoundingBoxGizmo,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MultiPointerScaleBehavior,
  Scene,
  SixDofDragBehavior,
  Vector3,
} from "babylonjs";

export default class UseBoundingBoxGizmo {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Use BoundingBox Gizmo";
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene();

    this.engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

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

    // basic meshes
    const ground = MeshBuilder.CreateGround("ground", {
      width: 6,
      height: 6,
      subdivisions: 2,
    });
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 16 },
      scene
    );
    sphere.position.y = 1;
    const sphere2 = MeshBuilder.CreateSphere(
      "sphere2",
      { diameter: 0.5, segments: 16 },
      scene
    );
    sphere2.position.y = 0.25;
    sphere2.position.x = 1.5;

    // set parent
    sphere.addChild(ground);
    ground.addChild(sphere2);

    // create gizmo and config parameter
    const gizmo = new BoundingBoxGizmo(Color3.Teal());
    gizmo.includeChildPredicate = (m) => m == sphere2;
    // gizmo.rotationSphereSize = 0.3;
    // gizmo.rotationSphereSize = 0;
    // gizmo.scaleBoxSize = 0.2;
    // gizmo.attachedMesh = sphere;

    // gizmo.setEnabledRotationAxis("y");
    const boundingBox =
      BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(sphere2);
    gizmo.attachedMesh = boundingBox;
    const sixDofDragBehavior = new SixDofDragBehavior();
    boundingBox.addBehavior(sixDofDragBehavior);
    // vr
    const multiPointerScaleBehavior = new MultiPointerScaleBehavior();
    boundingBox.addBehavior(multiPointerScaleBehavior);
    scene.createDefaultVRExperience({ floorMeshes: [ground] });

    // events
    gizmo.onScaleBoxDragObservable.add(() => {
      console.log("scale box dragging...");
    });
    gizmo.onScaleBoxDragEndObservable.add(() => {
      console.log("scale box drag end.");
    });
    gizmo.onRotationSphereDragObservable.add(() => {
      console.log("rotation dragging...");
    });
    gizmo.onRotationSphereDragEndObservable.add(() => {
      console.log("rotation drag end.");
    });

    return scene;
  }
}
