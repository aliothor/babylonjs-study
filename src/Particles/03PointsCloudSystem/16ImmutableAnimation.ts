import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointColor,
  PointsCloudSystem,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class ImmutableAnimation {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Immutable Animation";
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
      70,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const shape = [];
    let nbPoints = 12;
    let dTheta = (Math.PI * 2) / nbPoints;
    let radius = 0.5;
    for (let i = 0; i < nbPoints; i++) {
      shape.push(
        new Vector3(
          radius * Math.cos(i * dTheta),
          radius * Math.sin(i * dTheta),
          0
        )
      );
    }
    shape.push(shape[0]);
    // MeshBuilder.CreateLines("shape", { points: shape }).color = Color3.Red();

    const path = [];
    const height = 10;
    const waves = 2;
    const maxAngle = 2 * waves * Math.PI;
    nbPoints = 30;
    dTheta = maxAngle / nbPoints;
    for (let i = 0; i < nbPoints; i++) {
      path.push(new Vector3((height * Math.sin(i * dTheta)) / 10, i, 0));
    }
    // MeshBuilder.CreateLines("path", { points: path }).color = Color3.Green();

    const cone = MeshBuilder.ExtrudeShapeCustom("star", {
      shape,
      path,
      scaleFunction: (i) => {
        return 1 + i / 2;
      },
    });

    const pcs = new PointsCloudSystem("pcs", 1, scene, { updatable: false });
    pcs.addVolumePoints(
      cone,
      10000,
      PointColor.Stated,
      new Color4(1, 1, 1, 1),
      0.85
    );
    const mesh = await pcs.buildMeshAsync();
    cone.dispose();

    const ground = MeshBuilder.CreateGround("ground", {
      width: 100,
      height: 100,
    });

    let angle = 0;
    radius = 20;
    scene.registerAfterRender(() => {
      mesh.rotation.y += 0.5;
      mesh.position.x = (radius + 1 - 2 * Math.random()) * Math.cos(angle);
      mesh.position.z = (radius + 1 - 2 * Math.random()) * Math.sin(angle);
      angle += 0.01;
    });

    return scene;
  }
}
