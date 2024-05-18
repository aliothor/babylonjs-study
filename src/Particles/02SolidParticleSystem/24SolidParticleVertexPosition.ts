import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SolidParticle,
  SolidParticleSystem,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class SolidParticleVertexPosition {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particle Vertex Position Example";
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
    camera.setPosition(new Vector3(0, 50, -100));

    const rockMat = new StandardMaterial("rockMat");
    rockMat.diffuseTexture = new Texture("/Particles/rock.jpg");
    rockMat.backFaceCulling = false;

    const stars = MeshBuilder.CreateBox("stars", {
      size: 5000,
      sideOrientation: Mesh.BACKSIDE,
    });
    const starMat = new StandardMaterial("starMat");
    const starTex = new Texture("/Particles/stars1.jpg");
    starTex.uScale = 3;
    starTex.vScale = 3;
    starMat.diffuseTexture = starTex;
    stars.material = starMat;

    const fact = 600;
    function vertexFun(p: SolidParticle, vt: Vector3, i: number) {
      vt.x *= Math.random() + 1;
      vt.y *= Math.random() + 1;
      vt.z *= Math.random() + 1;
    }

    function posFun(p: SolidParticle) {
      p.scale.x = Math.random() * 2 + 0.8;
      p.scale.y = Math.random() + 0.8;
      p.scale.z = Math.random() * 2 + 0.8;
      p.position.x = (Math.random() - 0.5) * fact;
      p.position.y = (Math.random() - 0.5) * fact;
      p.position.z = (Math.random() - 0.5) * fact;
      p.rotation.x = Math.random() * 3.5;
      p.rotation.y = Math.random() * 3.5;
      p.rotation.z = Math.random() * 3.5;
      const grey = 1 - Math.random() * 0.3;
      p.color = new Color4(grey, grey, grey, 1);
    }

    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 6,
      segments: 8,
    });
    const sps = new SolidParticleSystem("sps", scene, { updatable: false });
    sps.addShape(sphere, 1000, {
      positionFunction: posFun,
      vertexFunction: vertexFun,
    });
    const mesh = sps.buildMesh();
    mesh.material = rockMat;
    sphere.dispose();

    let k = Date.now();
    scene.registerBeforeRender(() => {
      mesh.rotation.y += 0.001;
      mesh.position.y = Math.sin((k - Date.now()) / 1000) * 5;
      k += 0.02;
    });

    return scene;
  }
}
