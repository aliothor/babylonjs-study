import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
} from "babylonjs";

export default class EdgeRenderingInstance {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Edge Rendering Instance";
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

    const box = MeshBuilder.CreateBox("box");
    box.enableEdgesRendering();
    box.edgesWidth = 4;
    box.edgesColor = new Color4(0, 0, 1, 0.5);
    box.position.y = 1;
    box.visibility = 0.5;

    box.edgesShareWithInstances = true;

    const box2 = box.createInstance("box2");
    box2.position.x = -2;
    box2.position.z = -1;

    const box3 = box.createInstance("box3");
    box3.position.x = 2;
    box3.position.z = -1;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 6,
      height: 6,
      subdivisions: 2,
    });
    ground.enableEdgesRendering();
    ground.edgesWidth = 3;

    return scene;
  }
}
