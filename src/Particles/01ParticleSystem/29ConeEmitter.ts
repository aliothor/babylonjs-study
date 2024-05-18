import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "babylonjs";

export default class ConeEmitter {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Cone Emitter";
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
      20,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const particleSystem = new ParticleSystem("particle", 1000, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = Vector3.Zero();
    // particleSystem.minEmitBox = new Vector3(-0.5, 0, 0);
    // particleSystem.maxEmitBox = new Vector3(0.5, 0, 0);
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 1500;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    // Cone emitter
    const radius = 2;
    const angle = Math.PI / 3;
    const height = radius / Math.tan(angle / 2);
    const ce = particleSystem.createConeEmitter(radius, angle);
    ce.radiusRange = 0;
    ce.heightRange = 0;
    ce.emitFromSpawnPointOnly = true;

    particleSystem.start();

    // mesh wireframe
    const mesh = MeshBuilder.CreateCylinder("mesh", {
      diameterBottom: 0,
      diameterTop: radius * 2,
      height,
    });
    mesh.position.y = height / 2;
    mesh.material = new StandardMaterial("mat");
    mesh.material.wireframe = true;

    return scene;
  }
}
