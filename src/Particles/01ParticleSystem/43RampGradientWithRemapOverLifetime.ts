import {
  ArcRotateCamera,
  Color3,
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

export default class RampGradientWithRemapOverLifetime {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Ramp Gradient With Remap Over Lifetime";
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

    ptcSys.color1 = new Color4(1, 1, 1, 0.1);
    ptcSys.colorDead = new Color4(1, 1, 1, 0.9);

    ptcSys.addRampGradient(0.0, new Color3(1, 1, 1));
    ptcSys.addRampGradient(0.09, new Color3(209 / 255, 204 / 255, 15 / 255));
    ptcSys.addRampGradient(0.18, new Color3(221 / 255, 120 / 255, 14 / 255));
    ptcSys.addRampGradient(0.28, new Color3(200 / 255, 43 / 255, 18 / 255));
    ptcSys.addRampGradient(0.47, new Color3(115 / 255, 22 / 255, 15 / 255));
    ptcSys.addRampGradient(0.88, new Color3(14 / 255, 14 / 255, 14 / 255));
    ptcSys.addRampGradient(1.0, new Color3(14 / 255, 14 / 255, 14 / 255));
    ptcSys.useRampGradients = true;

    ptcSys.addColorRemapGradient(0, 0, 0.1);
    ptcSys.addColorRemapGradient(0.2, 0.1, 0.8);
    ptcSys.addColorRemapGradient(0.3, 0.2, 0.85);
    ptcSys.addColorRemapGradient(0.35, 0.4, 0.85);
    ptcSys.addColorRemapGradient(0.4, 0.5, 0.9);
    ptcSys.addColorRemapGradient(0.5, 0.95, 1.0);
    ptcSys.addColorRemapGradient(1.0, 0.95, 1.0);

    ptcSys.addAlphaRemapGradient(0, 0.1, 0.8);
    ptcSys.addAlphaRemapGradient(1, 0.1, 0.85);

    return scene;
  }
}
