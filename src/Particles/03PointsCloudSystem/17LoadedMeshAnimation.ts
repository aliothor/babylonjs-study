import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointColor,
  PointsCloudSystem,
  Scalar,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class LoadedMeshAnimation {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Loaded Mesh Animation";
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
      200,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const gloveMat = new StandardMaterial("gloveMat");
    gloveMat.diffuseTexture = new Texture("/Particles/glove.png");
    gloveMat.diffuseTexture.hasAlpha = true;
    const plane = MeshBuilder.CreatePlane("plane", {
      size: 150,
      sideOrientation: Mesh.DOUBLESIDE,
    });
    plane.position.z = -50;
    plane.position.y = 30;
    plane.material = gloveMat;

    const result = await SceneLoader.ImportMeshAsync(
      "him",
      "https://playground.babylonjs.com/scenes/Dude/",
      "Dude.babylon"
    );
    const meshes = result.meshes as Mesh[];
    meshes[0].setEnabled(false);
    meshes[0].rotation.y = Math.PI;

    const pcs = new PointsCloudSystem("pcs", 2, scene);
    pcs.addSurfacePoints(meshes[1], 10000, PointColor.Color);
    pcs.addSurfacePoints(meshes[2], 10000, PointColor.Color);
    pcs.addSurfacePoints(meshes[3], 10000, PointColor.Color);
    pcs.addSurfacePoints(meshes[4], 10000, PointColor.Color);
    const mesh = await pcs.buildMeshAsync();

    pcs.initParticles = () => {
      const bb = mesh.getBoundingInfo().boundingBox;
      const bbmin = bb.minimumWorld.y;
      for (let i = 0; i < pcs.nbParticles; i++) {
        pcs.particles[i].velocity = Vector3.Zero();
        const ay = (pcs.particles[i].position.y - bbmin) / 500;
        const ax = Scalar.RandomRange(-ay, ay);
        const az = Scalar.RandomRange(-ay, ay);
        pcs.particles[i].acceleration = new Vector3(
          0.25 * ax,
          0.5 * Math.abs(ay) * (1 + Math.random()),
          0.25 * az
        );
        const c = Scalar.RandomRange(0, 0.5);
        pcs.particles[i].color = new Color4(c, c, c, 1);
      }
    };
    pcs.initParticles();
    pcs.setParticles();
    mesh.visibility = 0;

    const dude = meshes[0];
    dude.setEnabled(true);
    let doEndgame = false;
    let updateSet = false;
    let start = false;
    let m: Mesh;
    scene.registerAfterRender(() => {
      if (plane.position.x < 200) {
        plane.position.x += 1;
      }
      if (plane.position.x == 200) {
        start = true;
        plane.setEnabled(false);
      }
      if (start && pcs && mesh.visibility < 1) {
        mesh.visibility += 0.002;
        dude.getChildren((child) => {
          m = child as Mesh;
          if (m.visibility <= 0) {
            m.visibility = 0;
          } else {
            m.visibility -= 0.005;
          }
          return true;
        });
        if (mesh.visibility > 0.5 && !updateSet) {
          pcs.updateParticle = (p) => {
            p.velocity.addInPlace(p.acceleration);
            p.position.addInPlace(p.velocity);
            return p;
          };
          updateSet = true;
          doEndgame = true;
        }
      }
      if (doEndgame) {
        pcs.setParticles();
      }
    });

    return scene;
  }
}
