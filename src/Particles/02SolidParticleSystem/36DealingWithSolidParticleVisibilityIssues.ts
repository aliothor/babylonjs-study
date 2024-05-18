import {
  ArcRotateCamera,
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
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class DealingWithSolidParticleVisibilityIssues {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Dealing With Solid Particle Visibility Issues";
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

    camera.setPosition(new Vector3(0, 50, -100));

    const mat = new StandardMaterial("mat");
    mat.backFaceCulling = false;
    const tex = new Texture("/Particles/brickNormal.png");
    mat.bumpTexture = tex;

    // particles system
    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 8,
      segments: 5,
    });
    const sps = new SolidParticleSystem("sps", scene, {
      particleIntersection: true,
      boundingSphereOnly: true,
    });
    sps.addShape(sphere, 800);
    const mesh = sps.buildMesh();
    mesh.material = mat;
    sphere.dispose();

    sps.isAlwaysVisible = true;

    sps.initParticles = () => {
      const fact = 600;
      for (let i = 0; i < sps.nbParticles; i++) {
        const p = sps.particles[i];
        p.position.x = (Math.random() - 0.1) * fact;
        p.position.y = (Math.random() - 0.1) * fact;
        p.position.z = (Math.random() - 0.1) * fact;
        p.rotation.x = Math.random() * 3.2;
        p.rotation.y = Math.random() * 3.2;
        p.rotation.z = Math.random() * 3.2;
        p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      }
    };

    sps.initParticles();
    sps.setParticles();

    scene.updateTransformMatrix();
    const planes = scene.frustumPlanes;

    sps.updateParticle = (p) => {
      if (!p.isInFrustum(planes)) {
        p.alive = false;
        sps.computeParticleVertex = false;
      } else {
        p.alive = true;
        sps.computeParticleVertex = true;
        p.rotation.x += p.idx * 0.00025;
        p.rotation.z += (sps.nbParticles - p.idx) * 0.0001;
      }
      return p;
    };

    // animation
    const d0 = Date.now();
    let k = 0;
    scene.registerBeforeRender(() => {
      k = Date.now() - d0;
      sps.setParticles();

      txt.text = `FPS : ${engine.getFps().toFixed()}`;
    });

    sps.computeParticleVertex = true;
    let q = 0;
    sps.updateParticleVertex = (p, vertex, i) => {
      if (!p.alive) return sps;
      q = i + k + p.idx * 0.005;
      if (i < 45) {
        vertex.position.x += Math.sin(q * 0.01);
        vertex.position.y += Math.cos(q * 0.05);
        vertex.position.z += Math.sin(q * 0.03);
      } else {
        vertex.position.x += Math.cos(q * 0.01);
        vertex.position.y += Math.sin(q * 0.05);
        vertex.position.z += Math.cos(q * 0.03);
      }
      vertex.color.r = Math.tan(vertex.position.y * 0.3 + p.position.x);

      return sps;
    };

    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const txt = new TextBlock("txt");
    adt.addControl(txt);
    txt.color = "white";
    txt.height = "30px";
    txt.width = "120px";
    txt.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
    txt.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;

    return scene;
  }
}
