import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "babylonjs";
import { GridMaterial } from "babylonjs-materials";

export default class ParticleDragChangingChangeOverLifetime {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Particle Drag Changing Change Over Lifetime";
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

    ptcSys.minLifeTime = 5;
    ptcSys.maxLifeTime = 5;

    ptcSys.minSize = 0.25;
    ptcSys.maxSize = 0.25;

    ptcSys.addDragGradient(0, 0.1);
    ptcSys.addDragGradient(1, 3);

    ptcSys.direction1 = new Vector3(8, 8, 0);

    return scene;
  }
}
