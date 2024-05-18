import {
  ArcRotateCamera,
  AxisDragGizmo,
  AxisScaleGizmo,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PlaneRotationGizmo,
  PositionGizmo,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";

export default class GizmoCustomization {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Gizmo Customization";
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
      5,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // create meshes
    const spheres = [];
    for (let i = 0; i < 4; i++) {
      const sphere = MeshBuilder.CreateIcoSphere("sphere", {
        radius: 0.2,
        flat: true,
        subdivisions: 1,
      });
      sphere.scaling.x = 2;
      sphere.position.x = i - 1.5;
      sphere.position.y = 0.5;
      spheres.push(sphere);
    }

    // position
    const posGizmo = new AxisDragGizmo(new Vector3(0, 1, 0), Color3.Teal());
    posGizmo.attachedMesh = spheres[0];
    // create custom mesh
    const posMat = new StandardMaterial(
      "posMat",
      posGizmo.gizmoLayer.utilityLayerScene
    );
    posMat.emissiveColor = Color3.Red();
    const posCustomMesh = MeshBuilder.CreateBox(
      "",
      { size: 0.1 },
      posGizmo.gizmoLayer.utilityLayerScene
    );
    posCustomMesh.material = posMat;
    posCustomMesh.scaling.y = 3;
    posCustomMesh.scaling.scaleInPlace(0.2);
    posCustomMesh.position.y = 0.05;
    posGizmo.setCustomMesh(posCustomMesh);

    // scaling
    const scaleGizmo = new AxisScaleGizmo(new Vector3(0, 1, 0), Color3.Blue());
    scaleGizmo.attachedMesh = spheres[1];
    const scaleMat = new StandardMaterial(
      "scaleMat",
      scaleGizmo.gizmoLayer.utilityLayerScene
    );
    scaleMat.emissiveColor = Color3.Blue();
    const scaleCustomMesh = MeshBuilder.CreateBox(
      "",
      { size: 0.1 },
      scaleGizmo.gizmoLayer.utilityLayerScene
    );
    scaleCustomMesh.material = scaleMat;
    scaleCustomMesh.scaling.y = 3;
    scaleCustomMesh.scaling.scaleInPlace(0.2);
    scaleCustomMesh.position.y = 0.05;
    scaleGizmo.setCustomMesh(scaleCustomMesh);

    // rotation
    const rotGizmo = new PlaneRotationGizmo(
      new Vector3(0, 0, 1),
      Color3.Teal()
    );
    rotGizmo.updateGizmoRotationToMatchAttachedMesh = false;
    rotGizmo.attachedMesh = spheres[2];
    const rotMat = new StandardMaterial(
      "rotMat",
      rotGizmo.gizmoLayer.utilityLayerScene
    );
    rotMat.emissiveColor = Color3.Yellow();
    const rotCustomMesh = MeshBuilder.CreateCylinder(
      "",
      {
        height: 0.1,
        diameter: 0.2,
      },
      rotGizmo.gizmoLayer.utilityLayerScene
    );
    rotCustomMesh.material = rotMat;
    rotCustomMesh.rotation.x = Math.PI / 2;
    rotCustomMesh.scaling.scaleInPlace(0.4);
    rotGizmo.setCustomMesh(rotCustomMesh);

    // multi gizmo
    const multiGizmo = new PositionGizmo();
    multiGizmo.attachedMesh = spheres[3];
    const multiMat = new StandardMaterial(
      "multiMat",
      multiGizmo.gizmoLayer.utilityLayerScene
    );
    multiMat.emissiveColor = Color3.Green();
    const multiCustomMesh = MeshBuilder.CreateBox(
      "",
      { size: 0.1 },
      multiGizmo.gizmoLayer.utilityLayerScene
    );
    multiCustomMesh.material = multiMat;
    multiCustomMesh.scaling.y = 3;
    multiCustomMesh.scaling.scaleInPlace(0.2);
    multiCustomMesh.position.y = 0.05;
    multiGizmo.yGizmo.setCustomMesh(multiCustomMesh);

    return scene;
  }
}
