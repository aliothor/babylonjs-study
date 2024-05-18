import {
  ArcRotateCamera,
  AssetsManager,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  MeshExploder,
  Scene,
  Vector3,
} from "babylonjs";
import "babylonjs-loaders";

export default class ExplodeLoadingModels {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Explode Loading Models";
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

    const assetsManger = new AssetsManager();
    const meshTask = assetsManger.addMeshTask(
      "models",
      "",
      "/Meshes/",
      "CB-BM10.glb"
    );

    let meshes: Mesh[] = [];
    meshTask.onSuccess = (task) => {
      meshes = task.loadedMeshes as Mesh[];
    };
    assetsManger.load();

    let newExplosion;
    scene.executeWhenReady(() => {
      newExplosion = new MeshExploder(meshes);
      newExplosion.explode(5);
    });

    return scene;
  }
}
