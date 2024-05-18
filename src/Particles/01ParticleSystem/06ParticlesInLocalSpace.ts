import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  NoiseProceduralTexture,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  StackPanel,
  Control,
  TextBlock,
  Slider,
} from "babylonjs-gui";

export default class ParticlesInLocalSpace {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Particles in Local Space";
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

    const fountain = MeshBuilder.CreateBox("fountain", { size: 1 });
    fountain.position.y = 3;
    const ground = MeshBuilder.CreateGround("ground", {
      width: 50,
      height: 50,
    });
    const gMat = new StandardMaterial("gMat");
    gMat.backFaceCulling = false;
    gMat.diffuseColor = new Color3(0.3, 0.3, 1);
    ground.material = gMat;

    const particleSystem = new ParticleSystem("particle", 1000, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = fountain;
    particleSystem.minEmitBox = new Vector3(-0.5, 0, 0);
    particleSystem.maxEmitBox = new Vector3(0.5, 0, 0);
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 1500;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new Vector3(0, -9.81, 0);
    particleSystem.direction1 = new Vector3(0, 5, 0);
    particleSystem.direction2 = new Vector3(0, 5, 0);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    particleSystem.isLocal = true;
    // particleSystem.worldOffset = new Vector3(0, 0, -5);
    particleSystem.start();

    // animation
    const keys = [];
    const anim = new Animation(
      "anim",
      "position.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    keys.push({
      frame: 0,
      value: 0,
    });
    keys.push({
      frame: 50,
      value: Math.PI * 2,
    });
    keys.push({
      frame: 100,
      value: 0,
    });
    anim.setKeys(keys);
    fountain.animations.push(anim);
    scene.beginAnimation(fountain, 0, 100, true);

    scene.registerBeforeRender(() => {
      fountain.rotation.x += 0.01;
    });

    return scene;
  }
}
