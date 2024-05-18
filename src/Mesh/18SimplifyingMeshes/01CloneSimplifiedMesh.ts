import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  ISimplificationSettings,
  MeshBuilder,
  Scene,
  SimplificationSettings,
  SimplificationType,
  StandardMaterial,
  Vector3,
} from "babylonjs";

export default class CloneSimplifiedMesh {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Clone Simplified Mesh";
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
      30,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 9,
      segments: 60,
    });
    sphere.position.x = -5;
    const sMat = new StandardMaterial("sMat");
    sphere.material = sMat;

    const settings: Array<ISimplificationSettings> = [];
    settings.push(new SimplificationSettings(0.1, 60));

    sphere.simplify(settings, true, SimplificationType.QUADRATIC, () => {
      sMat.diffuseColor = Color3.Red();
      sMat.alpha = 0.8;
      sMat.wireframe = true;

      const decimateMesh = sphere.getLODLevelAtDistance(60);
      const cloneDecimated = decimateMesh?.clone("SimplifiedMesh");
      cloneDecimated?.position.addInPlace(new Vector3(5, 0, 0));
    });

    return scene;
  }
}
