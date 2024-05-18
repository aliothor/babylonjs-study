import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "babylonjs";
import { GridMaterial } from "babylonjs-materials";

export default class ParticleSizeScaleColorSpeedRange {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Particle Size, Scale, Color & Speed Range";
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
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGround("ground", {
      width: 25,
      height: 25,
    });
    ground.material = new GridMaterial("gMat");
    ground.material.backFaceCulling = false;

    const ptcSys = new ParticleSystem("ptcSys", 2000, scene);
    ptcSys.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );
    ptcSys.emitter = new Vector3(0, 0.5, 0);
    ptcSys.start();

    // size
    ptcSys.minSize = 0.05;
    ptcSys.maxSize = 0.75;

    // scale
    ptcSys.minScaleX = 1.5;
    ptcSys.maxScaleX = 4.0;

    ptcSys.minScaleY = 1.2;
    ptcSys.maxScaleY = 3.0;

    // color
    ptcSys.color1 = new Color4(1, 0, 0, 1);
    ptcSys.color2 = new Color4(0, 1, 0, 1);
    ptcSys.colorDead = new Color4(1, 1, 1, 0);

    // speed
    ptcSys.minEmitPower = 0.1;
    ptcSys.maxEmitPower = 5;

    return scene;
  }
}
