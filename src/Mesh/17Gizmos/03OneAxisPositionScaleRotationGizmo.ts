import {
  ArcRotateCamera,
  AxisDragGizmo,
  AxisScaleGizmo,
  Color3,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  PlaneRotationGizmo,
  Scene,
  UtilityLayerRenderer,
  Vector3,
} from "babylonjs";

export default class OneAxisPositionScaleRotationGizmo {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "One Axis Position Scale and Rotation Gizmo";
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
    const positionGizmo = new AxisDragGizmo(
      new Vector3(1, 0, 0),
      Color3.Red(),
      utilLayer
    );
    positionGizmo.attachedMesh = box;
    positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;
    // scale
    const scaleGizmo = new AxisScaleGizmo(
      new Vector3(0, 1, 0),
      Color3.Green(),
      utilLayer
    );
    // rotation
    const rotationGizmo = new PlaneRotationGizmo(
      new Vector3(0, 1, 0),
      Color3.Blue(),
      utilLayer
    );
    rotationGizmo.updateGizmoRotationToMatchAttachedMesh = false;

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
