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
import {
  AdvancedDynamicTexture,
  Control,
  SelectionPanel,
  SliderGroup,
} from "babylonjs-gui";
import { GridMaterial } from "babylonjs-materials";

export default class AdjustMinAndMaxEmitBox {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Adjust Min And Max of EmitBox";
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
      30,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGround("ground", {
      width: 50,
      height: 50,
    });
    ground.material = new GridMaterial("gMat");
    ground.material.backFaceCulling = false;

    const ptcSys = new ParticleSystem("ptcSys", 2000, scene);
    ptcSys.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );
    ptcSys.emitter = new Vector3(0, 0, 0);
    ptcSys.start();

    ptcSys.minEmitBox = new Vector3(-1, -1, -1);
    ptcSys.maxEmitBox = new Vector3(1, 1, 1);

    ptcSys.minSize = 0.1;
    ptcSys.maxSize = 0.5;

    ptcSys.minLifeTime = 0.3;
    ptcSys.maxLifeTime = 1.5;

    ptcSys.emitRate = 1500;
    // speed
    ptcSys.minEmitPower = 1;
    ptcSys.maxEmitPower = 3;
    ptcSys.updateSpeed = 0.005;
    // direction
    ptcSys.direction1 = new Vector3(-7, 8, 3);
    ptcSys.direction2 = new Vector3(7, 8, -3);
    // gravity
    ptcSys.gravity = new Vector3(0, -9.81, 0);
    // color
    ptcSys.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    ptcSys.color2 = new Color4(0.2, 0.5, 1, 1.0);
    ptcSys.colorDead = new Color4(0, 0, 0.2, 0.0);

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const splanel = new SelectionPanel("sp");
    splanel.width = 0.25;
    splanel.height = 1;
    splanel.color = "white";
    splanel.headerColor = "yellow";
    splanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    splanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(splanel);

    const sliderX = new SliderGroup("Emit Box X");
    sliderX.addSlider(
      "Min",
      (value) => (ptcSys.minEmitBox.x = value),
      "",
      -5,
      5,
      -1,
      () => parseFloat(ptcSys.minEmitBox.x.toFixed(2))
    );
    sliderX.addSlider(
      "Max",
      (value) => (ptcSys.maxEmitBox.x = value),
      "",
      -5,
      5,
      1,
      () => parseFloat(ptcSys.maxEmitBox.x.toFixed(2))
    );
    splanel.addGroup(sliderX);

    const sliderY = new SliderGroup("Emit Box Y");
    sliderY.addSlider(
      "Min",
      (value) => (ptcSys.minEmitBox.y = value),
      "",
      -5,
      5,
      -1,
      () => parseFloat(ptcSys.minEmitBox.y.toFixed(2))
    );
    sliderY.addSlider(
      "Max",
      (value) => (ptcSys.maxEmitBox.y = value),
      "",
      -5,
      5,
      1,
      () => parseFloat(ptcSys.maxEmitBox.y.toFixed(2))
    );
    splanel.addGroup(sliderY);

    const sliderZ = new SliderGroup("Emit Box Z");
    sliderZ.addSlider(
      "Min",
      (value) => (ptcSys.minEmitBox.z = value),
      "",
      -5,
      5,
      -1,
      () => parseFloat(ptcSys.minEmitBox.z.toFixed(2))
    );
    sliderZ.addSlider(
      "Max",
      (value) => (ptcSys.maxEmitBox.z = value),
      "",
      -5,
      5,
      1,
      () => parseFloat(ptcSys.maxEmitBox.z.toFixed(2))
    );
    splanel.addGroup(sliderZ);

    return scene;
  }
}
