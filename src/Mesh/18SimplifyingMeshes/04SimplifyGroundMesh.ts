import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";

export default class SimplifyGroundMesh {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simplify Ground Mesh";
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
      12,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGroundFromHeightMap(
      "ground",
      "https://playground.babylonjs.com/textures/heightMap.png",
      {
        width: 20,
        height: 20,
        subdivisions: 100,
        onReady: (mesh) => {
          const mat = new StandardMaterial("mat");
          mat.diffuseColor = new Color3(1, 0, 1);
          mat.wireframe = true;
          mesh.material = mat;

          mesh.simplify([{ quality: 0.1, distance: 10 }]);
        },
      }
    );

    return scene;
  }
}
