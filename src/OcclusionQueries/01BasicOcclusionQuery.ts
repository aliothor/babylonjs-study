import {
  AbstractMesh,
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
} from "babylonjs";

export default class BasicOcclusionQuery {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Basic Occlusion Query";
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

    const ground = MeshBuilder.CreateGround("ground", {
      width: 6,
      height: 6,
      subdivisions: 2,
    });

    const plane = MeshBuilder.CreatePlane("plane", {
      size: 5,
    });
    plane.position.y = 1;
    plane.position.z = -2;

    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 2,
      segments: 16,
    });
    sphere.position.y = 1;
    sphere.occlusionQueryAlgorithmType =
      AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
    sphere.isOccluded = true;

    sphere.occlusionRetryCount = 120;
    sphere.occlusionType = AbstractMesh.OCCLUSION_TYPE_STRICT;
    // sphere.occlusionType = AbstractMesh.OCCLUSION_TYPE_OPTIMISTIC;
    scene.registerBeforeRender(() => {
      if (sphere.isOccluded) {
        scene.clearColor = new Color4(0.5, 0.8, 0.5);
      } else {
        scene.clearColor = new Color4(0.1, 0.2, 0.8);
      }
    });

    return scene;
  }
}
