import {
  ArcRotateCamera,
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
  Control,
  Slider,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";

export default class ChangingParticleDirectionWithNoise {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Changing Particle Direction With Noise";
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

    const fountain = MeshBuilder.CreateBox("fountain", { size: 0.01 });

    const particleSystem = new ParticleSystem("particle", 200, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = fountain;
    particleSystem.minEmitBox = new Vector3(0, 0, 0);
    particleSystem.maxEmitBox = new Vector3(0, 0, 0);
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
    particleSystem.direction1 = new Vector3(-1, 4, 1);
    particleSystem.direction2 = new Vector3(1, 4, -1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 0;
    particleSystem.maxEmitPower = 0;
    particleSystem.updateSpeed = 0.005;

    // noise
    const noiseTexture = new NoiseProceduralTexture("nt", 256);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new Vector3(100, 100, 100);

    particleSystem.start();

    // plane
    const plane = MeshBuilder.CreatePlane("plane", { size: 5 });
    const pMat = new StandardMaterial("pMat");
    pMat.disableLighting = true;
    pMat.backFaceCulling = false;
    pMat.emissiveTexture = noiseTexture;
    plane.material = pMat;
    plane.position.x = -10;

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel();
    panel.width = "220px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    adt.addControl(panel);

    const addSlider = function (
      title: string,
      value: number,
      min: number,
      max: number,
      onValueChanged: (newValue: number) => void,
      isInteger?: boolean
    ) {
      const header = new TextBlock();
      header.text = title + ": " + (isInteger ? value | 0 : value.toFixed(2));
      header.height = "20px";
      header.color = "white";
      panel.addControl(header);

      const slider = new Slider();
      slider.minimum = min;
      slider.maximum = max;
      slider.value = value;
      slider.height = "20px";
      slider.width = "200px";
      slider.onValueChangedObservable.add((value) => {
        header.text = title + ": " + (isInteger ? value | 0 : value.toFixed(2));
        onValueChanged(value);
      });
      panel.addControl(slider);
    };

    addSlider(
      "octaves",
      noiseTexture.octaves,
      0,
      8,
      (value) => {
        noiseTexture.octaves = value;
      },
      true
    );

    addSlider("persistence", noiseTexture.persistence, 0, 4, (value) => {
      noiseTexture.persistence = value;
    });

    addSlider("speed", noiseTexture.animationSpeedFactor, 0, 20, (value) => {
      noiseTexture.animationSpeedFactor = value;
    });

    addSlider("brightness", noiseTexture.brightness, 0, 1, (value) => {
      noiseTexture.brightness = value;
    });

    addSlider(
      "Noise strength (X)",
      particleSystem.noiseStrength.x,
      0,
      100,
      (value) => {
        particleSystem.noiseStrength.x = value;
      }
    );
    addSlider(
      "Noise strength (Y)",
      particleSystem.noiseStrength.x,
      0,
      100,
      (value) => {
        particleSystem.noiseStrength.y = value;
      }
    );
    addSlider(
      "Noise strength (Z)",
      particleSystem.noiseStrength.x,
      0,
      100,
      (value) => {
        particleSystem.noiseStrength.z = value;
      }
    );

    return scene;
  }
}
