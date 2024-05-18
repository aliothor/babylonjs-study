import {
  ArcRotateCamera,
  AssetsManager,
  Color3,
  Color4,
  CubeTexture,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  NodeMaterial,
  Scene,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class CombiningSPSWithNodeMaterial {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Combining SPS With Node Material";
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

    scene.clearColor = Color4.FromInts(30, 30, 35, 255);
    camera.minZ = 0.1;

    const env = CubeTexture.CreateFromPrefilteredData(
      "/Particles/studio.env",
      scene
    );
    env.name = "studioIBL";
    env.gammaSpace = false;
    env.rotationY = 1.9;
    scene.environmentTexture = env;
    scene.environmentIntensity = 1;

    const assetsMng = new AssetsManager();
    const ptcShader = assetsMng.addTextFileTask(
      "load particle shader",
      "/Particles/particleName.json"
    );
    assetsMng.load();
    assetsMng.onFinish = (task) => {
      const ptcJSON = JSON.parse(ptcShader.text);
      const ptcMat = NodeMaterial.Parse(ptcJSON, scene);
      ptcMat.build(false);

      const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 0.375,
        segments: 5,
      });
      sphere.material = ptcMat;

      // create particles
      createParticles(sphere);
    };

    function createParticles(sphere: Mesh) {
      const sps = new SolidParticleSystem("sps", scene, {
        useModelMaterial: true,
      });
      sps.addShape(sphere, 600);
      sps.buildMesh();
      sphere.dispose();

      const thetas: number[] = [];
      const rotations: number[] = [];
      const radius: number[] = [];
      const heights: number[] = [];
      const elevationSpeeds: number[] = [];
      const heightRange = 4;
      sps.initParticles = () => {
        for (let p of sps.particles) {
          let theta = Math.random() * Math.PI * 2;
          thetas.push(theta);
          rotations.push(Math.random() * 0.0025 + 0.0025);
          radius.push(Math.random() * 0.75 + 1.25);

          const height = Math.random();
          heights.push(height);
          elevationSpeeds.push(Math.random() * 0.0003 + 0.0003);

          const scale = Math.random() * 0.7 + 0.3;
          p.position = new Vector3(
            radius[p.idx] * Math.sin(theta),
            lerpValue(heightRange * -0.5, heightRange * 0.5, height),
            radius[p.idx] * Math.cos(theta)
          );
          p.scaling = new Vector3(scale, scale, scale);

          p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
        }
      };

      sps.initParticles();
      sps.setParticles();

      sps.updateParticle = (p) => {
        thetas[p.idx] += rotations[p.idx] * Math.sign((p.idx % 2) - 0.5);
        if (thetas[p.idx] > Math.PI * 2) thetas[p.idx] -= Math.PI * 2;

        p.position.x = radius[p.idx] * Math.sin(thetas[p.idx]);
        p.position.z = radius[p.idx] * Math.cos(thetas[p.idx]);

        heights[p.idx] += elevationSpeeds[p.idx];
        p.position.y = lerpValue(
          heightRange * -0.5,
          heightRange * 0.5,
          Math.sin((heights[p.idx] % 1) * Math.PI)
        );
        return p;
      };

      sps.computeParticleTexture = false;
      sps.computeParticleColor = false;

      scene.registerBeforeRender(() => {
        sps.setParticles();
      });
    }

    function lerpValue(x: number, y: number, target: number) {
      return x + (y - x) * target;
    }

    // scene.debugLayer.show();

    return scene;
  }
}
