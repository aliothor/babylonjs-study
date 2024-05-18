import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsViewer,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class SimpleGroundMeshWithHavokPhysics {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simple Ground Mesh With Havok Physics";
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

    camera.setPosition(new Vector3(0, 5, -15));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    light.intensity = 0.7;
    const viewer = new PhysicsViewer();

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
    sphere.position.y = 5;
    const ground = MeshBuilder.CreateGroundFromHeightMap(
      "ground",
      "https://playground.babylonjs.com/textures/heightMap.png",
      {
        width: 20,
        height: 20,
        maxHeight: 5,
        subdivisions: 100,
        onReady: (mesh) => {
          const gag = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {
            mass: 0,
          });
          viewer.showBody(gag.body);
          const sag = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {
            mass: 1,
          });
          viewer.showBody(sag.body);
        },
      }
    );

    return scene;
  }
}
