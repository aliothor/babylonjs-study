import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SolidParticle,
  SolidParticleSystem,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class ImmutableTownWithBuildings {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Immutable Town With 80,000 Buildings";
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

    scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);
    camera.setPosition(new Vector3(0, 20, -100));

    const nb = 80000;
    const fact = 600;
    let scaleX = 0;
    let scaleY = 0;
    let scaleZ = 0;
    let grey = 0;
    let uvSize = 0;

    const ground = MeshBuilder.CreateGround("ground", {
      width: fact,
      height: fact,
    });
    const gMat = new StandardMaterial("gMat");
    gMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    gMat.backFaceCulling = false;
    ground.material = gMat;

    function posFun(p: SolidParticle) {
      scaleX = Math.random() * 2 + 0.8;
      scaleY = Math.random() * 6 + 0.8;
      scaleZ = Math.random() * 2 + 0.8;
      uvSize = Math.random() * 0.9;
      p.scale.x = scaleX;
      p.scale.y = scaleY;
      p.scale.z = scaleZ;
      p.position.x = (Math.random() - 0.5) * fact;
      p.position.y = p.scale.y / 2 + 0.01;
      p.position.z = (Math.random() - 0.5) * fact;
      p.rotation.y = Math.random() * 3.5;
      grey = 1 - Math.random() * 0.5;
      p.color = new Color4(grey + 0.1, grey + 0.1, grey, 1);
      p.uvs.x = Math.random() * 0.1;
      p.uvs.y = Math.random() * 0.1;
      p.uvs.z = p.uvs.x + uvSize;
      p.uvs.w = p.uvs.y + uvSize;
    }

    const mat = new StandardMaterial("mat");
    mat.diffuseTexture = new Texture("/Particles/glassbuilding.jpg");
    const box = MeshBuilder.CreateBox("box");
    box.material = mat;

    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(box, nb, { positionFunction: posFun });
    const mesh = sps.buildMesh();
    mesh.material = mat;
    box.dispose();

    scene.registerBeforeRender(() => {
      mesh.rotation.y += 0.001;
      ground.rotation.y = mesh.rotation.y;
    });

    return scene;
  }
}
