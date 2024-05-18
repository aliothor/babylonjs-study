import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  SimplificationType,
  Vector3,
} from "babylonjs";

export default class SimplifyingConplexMeshes {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simplifying Conplex Meshes";
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
      80,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "https://playground.babylonjs.com/scenes/",
      "skull.babylon"
    );
    const skull = meshes[0] as Mesh;
    camera.target = skull.position;

    let start = Date.now();
    // skull.optimizeIndices(() => {
    //   skull.simplify(
    //     [
    //       { distance: 250, quality: 0.8 },
    //       { distance: 300, quality: 0.5 },
    //       { distance: 400, quality: 0.3 },
    //       { distance: 500, quality: 0.1 },
    //     ],
    //     false,
    //     SimplificationType.QUADRATIC,
    //     () => {
    //       console.log("time used: ", Date.now() - start);
    //     }
    //   );
    // });
    skull.simplify(
      [
        { distance: 250, quality: 0.8, optimizeMesh: true },
        { distance: 300, quality: 0.5, optimizeMesh: true },
        { distance: 400, quality: 0.3, optimizeMesh: true },
        { distance: 500, quality: 0.1, optimizeMesh: true },
      ],
      false,
      SimplificationType.QUADRATIC,
      () => {
        console.log("time used: ", Date.now() - start);
      }
    );

    return scene;
  }
}
