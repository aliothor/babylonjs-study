import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector2,
  Vector3,
} from "babylonjs";

export default class EmitterFromOutsideCone {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Emitter From Outside a Cone";
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
      5,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // mesh
    var fountain = MeshBuilder.CreateCylinder("fountain", {
      height: 0.01,
      diameter: 0.2,
    });
    fountain.position.y = 0.5;
    var child = new TransformNode("child");
    child.parent = fountain;
    child.position.y = 0.5;
    const cupMat = new StandardMaterial("coreMat");
    cupMat.diffuseColor = new Color3(0.3773, 0.093, 0.0266);
    cupMat.specularColor = Color3.Black();
    const mesh = MeshBuilder.CreateCylinder("mesh", {
      diameter: 0.9,
      height: 1,
    });
    fountain.material = cupMat;
    mesh.material = cupMat;

    const particleSystem = new ParticleSystem("particle", 1000, scene);
    particleSystem.particleTexture = new Texture(
      "/Particles/SteamSpriteSheet.png"
    );

    particleSystem.emitter = child.position;
    particleSystem.minEmitBox = new Vector3(0, 0, 0);
    particleSystem.maxEmitBox = new Vector3(0, 0, 0);
    // particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    // particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    // particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    // particleSystem.minSize = 0.1;
    // particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 4;
    particleSystem.maxLifeTime = 4;
    particleSystem.emitRate = 6;
    // particleSystem.minEmitPower = 1;
    // particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 1 / 60;

    particleSystem.startSpriteCellID = 0;
    particleSystem.endSpriteCellID = 31;
    particleSystem.spriteCellHeight = 256;
    particleSystem.spriteCellWidth = 128;
    particleSystem.spriteCellChangeSpeed = 4;

    particleSystem.minScaleX = 1.0;
    particleSystem.minScaleY = 2.0;
    particleSystem.maxScaleX = 1.0;
    particleSystem.maxScaleY = 2.0;

    particleSystem.addSizeGradient(0, 0.0, 0.0);
    particleSystem.addSizeGradient(1.0, 1, 1);

    particleSystem.addColorGradient(0, new Color4(1, 1, 1, 0));
    particleSystem.addColorGradient(0.5, new Color4(1, 1, 1, 70 / 255));
    particleSystem.addColorGradient(1.0, new Color4(1, 1, 1, 0));
    particleSystem.translationPivot = new Vector2(0, -0.5);
    particleSystem.billboardMode = AbstractMesh.BILLBOARDMODE_Y;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = new Vector3(0, 0, 0);

    // Cone emitter
    const radius = 0.4;
    const angle = Math.PI;
    const ce = particleSystem.createConeEmitter(radius, angle);
    ce.radiusRange = 0;
    ce.heightRange = 0;

    particleSystem.start();

    return scene;
  }
}
