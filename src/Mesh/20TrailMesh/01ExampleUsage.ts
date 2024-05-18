import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TrailMesh,
  Vector3,
} from "babylonjs";

export default class ExampleUsage {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Example Usage";
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
      25,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    let alpha = Math.PI;
    const box = MeshBuilder.CreateBox("box");
    box.scaling.y = 2;
    box.bakeCurrentTransformIntoVertices();
    box.position.x = Math.sin(alpha) * 10;
    box.position.z = Math.cos(alpha) * 10;
    box.computeWorldMatrix(true);

    const trail = new TrailMesh("trail", box, scene, 0.5, 60, true);

    const mat = new StandardMaterial("mat");
    mat.emissiveColor = mat.diffuseColor = Color3.Red();
    mat.specularColor = Color3.Black();
    trail.material = mat;

    scene.onBeforeRenderObservable.add(() => {
      alpha += Math.PI / 120;
      box.position.x = Math.sin(alpha) * 10;
      box.position.z = Math.cos(alpha) * 10;
      box.rotation.x = (Math.PI * alpha) / 2;
      box.rotation.y = alpha;
    });

    let play = true;
    scene.onKeyboardObservable.add((e) => {
      if (e.type === KeyboardEventTypes.KEYUP) {
        if (e.event.key === " ") {
          play = !play;
          if (play) trail.start();
          else trail.stop();
        }
      }
    });

    return scene;
  }
}
