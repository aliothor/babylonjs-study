import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointColor,
  PointsCloudSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
  WebGPUEngine,
} from "babylonjs";

export default class SurfaceUVFromMeshTexture {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Surface UV from Mesh Texture";
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

    // https://assets.babylonjs.com/environments/spriteAtlas.png
    // Materials/spriteAtlas.png

    const rows = 4;
    const cols = 6;
    const faceUV = new Array(6);
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows);
    }
    const box = MeshBuilder.CreateBox("box", {
      width: 10,
      height: 3,
      depth: 5,
      faceUV,
    });

    const mat = new StandardMaterial("mat");
    const tex = new Texture("/Materials/spriteAtlas.png");
    mat.diffuseTexture = tex;
    box.material = mat;

    const pcs = new PointsCloudSystem("pcs", 5, scene);
    pcs.addSurfacePoints(box, 10000, PointColor.UV);
    const mesh = await pcs.buildMeshAsync();
    mesh.material!.emissiveTexture = tex;
    box.dispose();

    return scene;
  }
}
