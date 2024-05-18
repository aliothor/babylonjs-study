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
  Texture,
  Vector3,
} from "babylonjs";

export default class SimplifyingShpheres {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simplifying Shpheres";
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
      50,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const sphere0 = MeshBuilder.CreateSphere("sphere0", {
      diameter: 9,
      segments: 60,
    });
    const sphere1 = MeshBuilder.CreateSphere("sphere1", {
      diameter: 9,
      segments: 60,
    });
    const sphere2 = MeshBuilder.CreateSphere("sphere2", {
      diameter: 9,
      segments: 60,
    });
    const sphere3 = MeshBuilder.CreateSphere("sphere3", {
      diameter: 9,
      segments: 60,
    });

    sphere0.position.x = -20;
    sphere1.position.x = -5;
    sphere2.position.x = 10;
    sphere3.position.x = 25;

    const sMat0 = new StandardMaterial("sMat0");
    const sMat1 = new StandardMaterial("sMat1");
    const sMat2 = new StandardMaterial("sMat2");
    const sMat3 = new StandardMaterial("sMat3");

    sphere0.material = sMat0;
    sphere1.material = sMat1;
    sphere2.material = sMat2;
    sphere3.material = sMat3;

    const settings: Array<ISimplificationSettings> = [];
    settings.push(new SimplificationSettings(0.9, 50));
    settings.push(new SimplificationSettings(0.5, 80));
    settings.push(new SimplificationSettings(0.3, 100));
    settings.push(new SimplificationSettings(0.1, 180));

    const url = "https://playground.babylonjs.com/textures/";
    sphere0.simplify(settings, true, SimplificationType.QUADRATIC, () => {
      sMat0.diffuseColor = Color3.Red();
      sMat0.alpha = 0.8;
      sMat0.wireframe = true;
    });

    sphere1.simplify(settings, true, SimplificationType.QUADRATIC, () => {
      sMat1.diffuseTexture = new Texture(url + "misc.jpg");
    });

    sphere2.simplify(settings, true, SimplificationType.QUADRATIC, () => {
      sMat2.diffuseTexture = new Texture(url + "misc.jpg");
      sMat2.diffuseTexture.uOffset = 0.4;
      sMat2.diffuseTexture.vOffset = 0.1;
      sMat2.backFaceCulling = false;
    });

    sphere3.simplify(settings, true, SimplificationType.QUADRATIC, () => {
      sMat3.diffuseTexture = new Texture(url + "tree.png");
      sMat3.diffuseTexture.hasAlpha = true;
      sMat3.backFaceCulling = false;
    });

    scene.debugLayer.show({ embedMode: true });

    return scene;
  }
}
