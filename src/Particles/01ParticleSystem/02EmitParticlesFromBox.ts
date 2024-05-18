import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  ParticleHelper,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "babylonjs";
import { GridMaterial } from "babylonjs-materials";

export default class EmitParticlesFromBox {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Emit Particles From a Box";
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

    // particle sys
    const particleSystem = new ParticleSystem("particleSys", 2000, scene);

    // texture
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    // position
    // particleSystem.emitter = new Vector3(0, 0.5, 0);
    const box = MeshBuilder.CreateBox("box");
    box.position = new Vector3(-1, 1, -2);
    particleSystem.emitter = box;

    // limit
    particleSystem.minEmitBox = new Vector3(-0.2, -0.2, -0.2);
    particleSystem.maxEmitBox = new Vector3(0.2, 0.2, 0.2);

    // particleSystem.start(3000);
    particleSystem.startDelay = 3000;
    particleSystem.start();

    particleSystem.targetStopDuration = 5;
    particleSystem.updateSpeed = 0.02;
    particleSystem.disposeOnStop = true;

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYUP) {
        if (kbInfo.event.key == " ") {
          if (particleSystem.isStarted()) {
            particleSystem.stop();
          } else {
            particleSystem.start();
          }
        }
        if (kbInfo.event.key == "s") {
          if (particleSystem.isStarted()) {
            particleSystem.stop();
            particleSystem.reset();
          }
        }
      }
    });

    // helper
    // ParticleHelper.CreateDefault(new Vector3(0, 0.5, 0)).start();

    return scene;
  }
}
