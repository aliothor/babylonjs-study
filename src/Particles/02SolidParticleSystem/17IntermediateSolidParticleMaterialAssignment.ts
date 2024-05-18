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

export default class IntermediateSolidParticleMaterialAssignment {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Intermediate Solid Particle Material Assignment";
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

    const particleNb = 200;
    const areaSize = 200;
    const particleSize = 12;
    camera.setPosition(new Vector3(0, 0, -areaSize * 1.5));

    function initParticle(p: SolidParticle) {
      p.position.x = areaSize * (Math.random() - 0.5);
      p.position.y = areaSize * (Math.random() - 0.5);
      p.position.z = areaSize * (Math.random() - 0.5);

      p.rotation.x = 6.28 * Math.random();
      p.rotation.y = 6.28 * Math.random();
      p.rotation.z = 6.28 * Math.random();

      p.scaling.x = particleSize * (Math.random() + 0.2);
      p.scaling.y = particleSize * (Math.random() + 0.2);
      p.scaling.z = particleSize * (Math.random() + 0.2);

      // 指定材质
      if (p.position.y > areaSize * 0.3) {
        p.materialIndex = 1;
      }
      if (p.position.y < -areaSize * 0.3) {
        p.materialIndex = 2;
      }

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
    sps.setMultiMaterial([bMat, pMat, mat2]);

    sps.updateParticle = initParticle;
    sps.setParticles();
    sps.computeSubMeshes();

    box.dispose();
    poly.dispose();

    // glow layer
    const gl = new GlowLayer("glow", scene, {
      blurKernelSize: 32,
    });

    return scene;
  }
}
