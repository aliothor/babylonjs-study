import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  PositionGizmo,
  RotationGizmo,
  ScaleGizmo,
  Scene,
  UtilityLayerRenderer,
  Vector3,
} from "babylonjs";

export default class GizmoSnapDistanceSensitivity {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Gizmo snapDistance and Sensitivity";
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

    const box = MeshBuilder.CreateBox("box");
    box.position.y = 0.5;
    const ground = MeshBuilder.CreateGround("ground", {
      width: 6,
      height: 6,
      subdivisions: 2,
    });

    const utilLayer = new UtilityLayerRenderer(scene);
    // position
    const positionGizmo = new PositionGizmo(utilLayer);
    positionGizmo.attachedMesh = box;
    positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;
    positionGizmo.updateGizmoRotationToMatchAttachedMesh = true;
    // positionGizmo.snapDistance = 0.3;
    positionGizmo.onDragStartObservable.add(() => {
      console.log("start...");
    });
    positionGizmo.onDragEndObservable.add(() => {
      console.log("end...");
    });
    // scale
    const scaleGizmo = new ScaleGizmo(utilLayer);
    // scaleGizmo.snapDistance = 0.1;
    // scaleGizmo.sensitivity = 10;
    // rotation
    const rotationGizmo = new RotationGizmo(utilLayer);
    rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false;
    rotationGizmo.updateGizmoPositionToMatchAttachedMesh = true;
    // rotationGizmo.snapDistance = 0.171;
    // rotationGizmo.sensitivity = 3;

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === "p") {
          positionGizmo.attachedMesh = positionGizmo.attachedMesh ? null : box;
        }
        if (kbInfo.event.key === "s") {
          scaleGizmo.attachedMesh = scaleGizmo.attachedMesh ? null : box;
        }
        if (kbInfo.event.key === "r") {
          rotationGizmo.attachedMesh = rotationGizmo.attachedMesh ? null : box;
        }
      }
    });

    return scene;
  }
}
