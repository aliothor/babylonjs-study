import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointColor,
  PointsCloudSystem,
  Scene,
  SceneLoader,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import "babylonjs-loaders";

export default class SurfaceColorFromImportedMeshTexture {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Surface Color from Imported Mesh Texture";
  }

  async InitScene() {
    const engine = await this.CreateEngine();
    const scene = await this.CreateScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  async CreateEngine(gpu: boolean = false): Promise<Engine> {
    if (gpu) {
      const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        const engine = new WebGPUEngine(this.canvas);
        await engine.initAsync();
        return engine;
      }
    }
    return new Engine(this.canvas);
  }

  async CreateScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMesh(
      "",
      "https://playground.babylonjs.com/scenes/",
      "seagulf.glb",
      scene,
      (meshes) => {
        meshes[0].setEnabled(false);
        camera.zoomOn([meshes[1]]);

        const pcs = new PointsCloudSystem("pcs", 1, scene);
        pcs.addSurfacePoints(meshes[1], 100000, PointColor.Color, 0);
        pcs.buildMeshAsync();
      }
    );

    return scene;
  }
}