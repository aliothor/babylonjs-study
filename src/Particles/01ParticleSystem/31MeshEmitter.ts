import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MeshParticleEmitter,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "babylonjs";

export default class MeshEmitter {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Mesh Emitter";
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

    // emitter object
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1, segments: 6 },
      scene
    );
    const sMat = new StandardMaterial("sMat");
    sMat.diffuseColor = new Color3(0.1, 0.1, 0.4);
    sMat.specularColor = Color3.Black();
    sphere.material = sMat;
    sMat.wireframe = true;

    const particleSystem = new ParticleSystem("particle", 10000, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = sphere;
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.1;
    particleSystem.minLifeTime = 4;
    particleSystem.maxLifeTime = 4;
    particleSystem.emitRate = 500;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 4;
    particleSystem.updateSpeed = 0.01;

    // emitter type
    const meshEmitter = new MeshParticleEmitter(sphere);
    particleSystem.particleEmitterType = meshEmitter;

    particleSystem.start();

    return scene;
  }
}
