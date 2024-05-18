import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MaterialPluginBase,
  Mesh,
  MeshBuilder,
  MeshDebugMode,
  MeshDebugPluginMaterial,
  PBRMaterial,
  Scene,
  SceneLoader,
  Vector3,
} from "babylonjs";
import "babylonjs-loaders";

export default class ShowTrianglesAndVertex {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Show Triangles And Vertex";
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

    // const camera = new ArcRotateCamera(
    //   "camera",
    //   -Math.PI / 2,
    //   Math.PI / 2.5,
    //   0.08,
    //   new Vector3(0, 0, 0)
    // );
    // camera.attachControl(this.canvas, true);
    // camera.minZ = 0.001;

    // const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    await SceneLoader.ImportMeshAsync(
      "",
      "https://playground.babylonjs.com/scenes/",
      "BoomBox.glb"
    );

    scene.createDefaultCameraOrLight(true, true, true);

    for (const mesh of scene.meshes) {
      MeshDebugPluginMaterial.PrepareMeshForTrianglesAndVerticesMode(
        mesh as Mesh
      );
    }

    // for (const mat of scene.materials) {
    //   new MeshDebugPluginMaterial(mat as PBRMaterial, {
    //     mode: MeshDebugMode.VERTICES,
    //     vertexColor: Color3.Magenta(),
    //     vertexRadius: 1.2,
    //   });
    // }

    for (const mat of scene.materials) {
      new MeshDebugPluginMaterial(mat as PBRMaterial, {
        mode: MeshDebugMode.TRIANGLES_VERTICES,
        wireframeVerticesColor: Color3.Teal(),
        wireframeThickness: 1,
        vertexColor: Color3.Magenta(),
        vertexRadius: 1.2,
      });
    }

    return scene;
  }
}
