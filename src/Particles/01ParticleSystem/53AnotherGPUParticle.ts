import {
  ArcRotateCamera,
  Engine,
  GPUParticleSystem,
  HemisphericLight,
  ParticleSystem,
  Scene,
  SphereParticleEmitter,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  Checkbox,
  ColorPicker,
  Control,
  Slider,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";

export default class AnotherGPUParticle {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Another GPUParticle Example";
  }

  async InitScene() {
    const engine = await this.CreateEngine();
    const scene = await this.CreateScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  async CreateEngine(gpu: boolean = false): Promise<Engine> {
    if (gpu) {
      const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        const engine = new WebGPUEngine(this.canvas);
        await engine.initAsync();
        return engine;
      }
    }
    return new Engine(this.canvas);
  }

  async CreateScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    let ptcSys: ParticleSystem | GPUParticleSystem;
    let useGPUVersion = true;

    function createParticleSystem() {
      if (ptcSys) {
        ptcSys.dispose();
      }

      if (useGPUVersion && GPUParticleSystem.IsSupported) {
        ptcSys = new GPUParticleSystem("ptc", { capacity: 1000000 }, scene);
        ptcSys.activeParticleCount = 200000;
      } else {
        ptcSys = new ParticleSystem("ptc", 50000, scene);
      }

      ptcSys.emitter = Vector3.Zero();
      ptcSys.emitRate = 10000;
      ptcSys.particleEmitterType = new SphereParticleEmitter(1);
      ptcSys.particleTexture = new Texture("/Particles/flare.png");
      ptcSys.maxLifeTime = 10;
      ptcSys.minSize = 0.01;
      ptcSys.maxSize = 0.1;

      ptcSys.start();
    }

    createParticleSystem();

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const rightPanel = new StackPanel();
    rightPanel.width = "300px";
    rightPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    rightPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    rightPanel.fontSize = 16;
    adt.addControl(rightPanel);

    const bottomPanel = new StackPanel();
    bottomPanel.height = "50px";
    bottomPanel.paddingRight = "20px";
    bottomPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    bottomPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    bottomPanel.fontSize = 16;
    adt.addControl(bottomPanel);

    const upPanel = new StackPanel();
    upPanel.height = "50px";
    upPanel.width = "200px";
    upPanel.isVertical = true;
    upPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    upPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    upPanel.fontSize = 16;
    adt.addControl(upPanel);

    const lefPanel = new StackPanel();
    lefPanel.width = "300px";
    lefPanel.isVertical = true;
    lefPanel.paddingLeft = "20px";
    lefPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    lefPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    lefPanel.fontSize = 16;
    adt.addControl(lefPanel);

    function getPropertyPath(property: string) {
      const dotIndex = property.indexOf(".");
      if (dotIndex === -1) {
        return ptcSys[property];
      }
      const splits = property.split(".");
      return ptcSys[splits[0]][splits[1]];
    }

    function setPropertyPath(property: string, value: any) {
      const dotIndex = property.indexOf(".");
      if (dotIndex === -1) {
        ptcSys[property] = value;
        return;
      }
      const splits = property.split(".");
      ptcSys[splits[0]][splits[1]] = value;
    }

    function addColorPicker(
      text: string,
      property: string,
      left: string | number,
      panel: StackPanel
    ) {
      const header = new TextBlock();
      header.text = text;
      header.height = "30px";
      header.color = "white";
      header.outlineWidth = 4;
      header.outlineColor = "black";
      header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      panel.addControl(header);

      if (left) {
        header.left = left;
      }

      const colorPicker = new ColorPicker();
      colorPicker.size = "100px";
      colorPicker.value = ptcSys[property];
      colorPicker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      colorPicker.onValueChangedObservable.add((value) => {
        ptcSys[property] = value;
      });

      if (left) {
        colorPicker.left = left;
      }
      panel.addControl(colorPicker);
      return colorPicker;
    }

    addColorPicker("color1:", "color1", "20px", lefPanel);
    addColorPicker("color2:", "color2", "20px", lefPanel);
    addColorPicker("colorDead:", "colorDead", "20px", lefPanel);

    function addCheckbox(
      text: string,
      initial: boolean,
      onCheck: (value: boolean) => void,
      panel: StackPanel
    ) {
      const checkbox = new Checkbox();
      checkbox.width = "20px";
      checkbox.height = "20px";
      checkbox.color = "green";
      checkbox.isChecked = initial;
      checkbox.onIsCheckedChangedObservable.add((value) => {
        onCheck(value);
      });

      const header = Control.AddHeader(checkbox, text, "180px", {
        isHorizontal: true,
        controlFirst: true,
      });
      header.height = "30px";
      header.color = "white";
      header.outlineWidth = "4px";
      header.outlineColor = "black";
      header.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

      panel.addControl(header);
    }

    function addHeader(text: string, panel: StackPanel) {
      const header = new TextBlock();
      header.text = text;
      header.height = "30px";
      header.color = "white";
      header.outlineWidth = 4;
      header.outlineColor = "black";
      header.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

      panel.addControl(header);
    }

    function addSlider(
      text: string,
      property: string,
      min: number,
      max: number,
      left: string | number,
      panel: StackPanel,
      fixedPoint: number
    ) {
      const topPanel = new StackPanel();
      topPanel.height = "30px";
      topPanel.isVertical = false;
      panel.addControl(topPanel);

      const header = new TextBlock();
      header.text = text;
      header.width = "150px";
      header.color = "white";
      header.outlineWidth = 4;
      header.outlineColor = "black";
      header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      topPanel.addControl(header);
      if (left) {
        header.left = left;
      }

      const valueHeader = new TextBlock();
      valueHeader.text = getPropertyPath(property).toFixed(fixedPoint);
      valueHeader.width = "100px";
      valueHeader.color = "white";
      valueHeader.outlineWidth = 4;
      valueHeader.outlineColor = "black";
      valueHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      topPanel.addControl(valueHeader);

      const slider = new Slider();
      slider.minimum = min;
      slider.maximum = max;
      slider.height = "20px";
      slider.color = "green";
      slider.background = "white";
      slider.value = getPropertyPath(property);
      slider.onValueChangedObservable.add((value) => {
        valueHeader.text = value.toFixed(fixedPoint);
        setPropertyPath(property, value);
      });

      if (left) {
        slider.paddingLeft = left;
      }

      panel.addControl(slider);

      return slider;
    }

    function addBottom(value: boolean) {
      bottomPanel.clearControls();
      if (value) {
        addSlider(
          "particles count:",
          "activeParticleCount",
          0,
          ptcSys.getCapacity(),
          "20px",
          bottomPanel,
          0
        );
      } else {
        addHeader("particles count: " + ptcSys.getCapacity(), bottomPanel);
      }
    }
    addBottom(GPUParticleSystem.IsSupported);

    addSlider("updateSpeed:", "updateSpeed", 0, 0.1, "20px", rightPanel, 2);
    addSlider("gravity:", "gravity.y", -5, 5, "20px", rightPanel, 2);
    addSlider("minSize:", "minSize", 0.01, 1, "20px", rightPanel, 2);
    addSlider("maxSize:", "maxSize", 0.01, 1, "20px", rightPanel, 2);
    addSlider("minLifeTime:", "minLifeTime", 0.001, 10, "20px", rightPanel, 2);
    addSlider("maxLifeTime:", "maxLifeTime", 0.001, 10, "20px", rightPanel, 2);
    addSlider("minEmitPower:", "minEmitPower", 0, 10, "20px", rightPanel, 2);
    addSlider("maxEmitPower:", "maxEmitPower", 0, 10, "20px", rightPanel, 2);

    if (GPUParticleSystem.IsSupported) {
      addCheckbox(
        "Use GPU Version",
        useGPUVersion,
        (value) => {
          useGPUVersion = value;
          createParticleSystem();
          addBottom(value);
        },
        upPanel
      );
    }

    return scene;
  }
}
