import {
  ArcRotateCamera,
  Color3,
  Engine,
  GlowLayer,
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

export default class AdvancedSolidParticleMaterialAssignment {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Advanced Solid Particle Material Assignment Auto Compute SubMesh";
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

    const particleNb = 400;
    const areaSize = 200;
    const particleSize = 4;
    camera.setPosition(new Vector3(0, 0, -areaSize * 1.5));

    const root = Math.sqrt(particleNb) | 0;
    let row = 0;
    let col = 0;
    let step = areaSize / root;
    let orig = -areaSize * 0.5;

    function initParticle(p: SolidParticle) {
      p.position.x = orig + col * step;
      p.position.y = orig + row * step;
      p.scaling.copyFromFloats(particleSize, particleSize, particleSize);
      p.materialIndex = 0;
      row = (row + 1) % root;
      if (row == 0) col++;

      return p;
    }

    const box = MeshBuilder.CreateBox("box");
    const bMat = new StandardMaterial("bMat");
    bMat.emissiveColor = Color3.Green();
    // box.material = bMat;

    const poly = MeshBuilder.CreatePolyhedron("poly", { size: 0.5 });
    const pMat = new StandardMaterial("pMat");
    pMat.diffuseTexture = new Texture("/Particles/brick.png");
    pMat.bumpTexture = new Texture("/Particles/brickNormal.png");
    // poly.material = pMat;

    const mat2 = new StandardMaterial("mat2");
    mat2.diffuseColor = Color3.Yellow();

    const sps = new SolidParticleSystem("sps", scene, {
      enableMultiMaterial: true,
      // updatable: false,
    });
    // sps.addShape(box, particleNb * 0.5, { positionFunction: initParticle });
    // sps.addShape(poly, particleNb * 0.5, { positionFunction: initParticle });
    sps.addShape(box, particleNb * 0.5);
    sps.addShape(poly, particleNb * 0.5);

    sps.buildMesh();
    sps.setMultiMaterial([bMat, mat2, pMat]);

    sps.updateParticle = initParticle;
    sps.setParticles();
    sps.computeSubMeshes();

    box.dispose();
    poly.dispose();

    // glow layer
    const gl = new GlowLayer("glow", scene, {
      blurKernelSize: 32,
    });

    sps.updateParticle = (p) => {
      if (Math.random() < 0.01) {
        p.materialIndex = (Math.random() * 2) | 0;
      }
      return p;
    };
    sps.autoUpdateSubMeshes = true;

    // animation
    sps.mesh.position.x = -20;
    scene.registerBeforeRender(() => {
      sps.setParticles();
    });

    return scene;
  }
}
