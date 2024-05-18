import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  HingeConstraint,
  Matrix,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsViewer,
  Quaternion,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import {
  AdvancedDynamicTexture,
  Button,
  Checkbox,
  Control,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class PendulumInstancesPhysics {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Pendulum Instances Physics";
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
    light.intensity = 0.7;

    camera.setPosition(new Vector3(0, 10, -30));

    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());
    const viewer = new PhysicsViewer();
    let showViewer = false;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 40,
      height: 40,
      subdivisions: 2,
    });
    ground.receiveShadows = true;
    const groundShape = new PhysicsShapeBox(
      Vector3.Zero(),
      Quaternion.Identity(),
      new Vector3(40, 0.1, 40),
      scene
    );
    groundShape.material = { friction: 0.2, restitution: 0.3 };
    const groundBody = new PhysicsBody(
      ground,
      PhysicsMotionType.STATIC,
      false,
      scene
    );
    groundBody.shape = groundShape;
    groundBody.setMassProperties({ mass: 0 });
    if (showViewer) {
      viewer.showBody(groundBody);
    }

    // body
    function addInstance(pos: Vector3) {
      const box = MeshBuilder.CreateBox("box");

      // layout
      const instancCount = 5;
      const spacing = 2;
      let m = Matrix.Identity();
      const rm = Matrix.Identity();
      const r = Quaternion.Identity();
      const ridx = [0, 1, 2, 4, 5, 6, 8, 9, 10];
      let index = 0;
      const matricesData = new Float32Array(instancCount * 16);
      const colorsData = new Float32Array(instancCount * 4);

      for (let x = 0; x < instancCount; x++) {
        m.m[12] = x * spacing + pos.x;
        m.m[13] = pos.y;
        m.m[14] = pos.z;

        Quaternion.FromEulerAnglesToRef(0, 0, 0, r);
        r.toRotationMatrix(rm);
        for (let i of ridx) {
          m.m[i] = rm.m[i];
        }
        m.copyToArray(matricesData, index * 16);

        // color
        colorsData[index * 4 + 0] = Math.random();
        colorsData[index * 4 + 1] = Math.random();
        colorsData[index * 4 + 2] = Math.random();
        colorsData[index * 4 + 3] = 1;

        index++;
      }

      box.thinInstanceSetBuffer("matrix", matricesData, 16, false);
      box.thinInstanceSetBuffer("color", colorsData, 4);

      const boxShape = new PhysicsShapeBox(
        Vector3.Zero(),
        Quaternion.Identity(),
        new Vector3(1, 1, 1),
        scene
      );
      const boxBody = new PhysicsBody(
        box,
        PhysicsMotionType.DYNAMIC,
        false,
        scene
      );
      boxBody.shape = boxShape;
      boxBody.setMassProperties({ mass: 1 });
      if (showViewer) {
        viewer.showBody(boxBody);
      }

      return box;
    }
    const instance = addInstance(new Vector3(0, 10, 0));

    instance.physicsBody?.setMotionType(PhysicsMotionType.STATIC, 0);
    instance.physicsBody?.setMassProperties({ mass: 0 }, 0);

    const distance = 2;
    const axis = new Vector3(0, 1, 0);
    for (let i = 1; i < instance.thinInstanceCount; i++) {
      const constraint = new HingeConstraint(
        axis,
        axis.scale(distance * (i + 1) - 1),
        axis,
        axis,
        scene
      );
      instance.physicsBody?.addConstraint(
        instance.physicsBody,
        constraint,
        0,
        i
      );
    }

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel();
    adt.addControl(panel);
    panel.spacing = 5;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.paddingLeftInPixels = 10;
    panel.paddingTopInPixels = 10;
    panel.width = "30%";

    const toggleViewLine = new StackPanel("toggleViewLine");
    panel.addControl(toggleViewLine);
    toggleViewLine.isVertical = false;
    toggleViewLine.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleViewLine.spacing = 5;
    toggleViewLine.height = "25px";
    toggleViewLine.paddingTop = 2;

    const viewerCheckbox = new Checkbox();
    toggleViewLine.addControl(viewerCheckbox);
    viewerCheckbox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    viewerCheckbox.width = "20px";
    viewerCheckbox.height = "20px";
    viewerCheckbox.isChecked = showViewer;
    viewerCheckbox.color = "green";
    viewerCheckbox.onIsCheckedChangedObservable.add((value) => {
      if (value) {
        for (let mesh of scene.meshes) {
          if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
          }
        }
        showViewer = true;
      } else {
        for (let mesh of scene.meshes) {
          if (mesh.physicsBody) {
            viewer.hideBody(mesh.physicsBody);
          }
        }
        showViewer = false;
      }
    });

    const checkboxText = new TextBlock("checkboxText", "Debug Viewer");
    toggleViewLine.addControl(checkboxText);
    checkboxText.resizeToFit = true;
    checkboxText.color = "white";

    function addButton(text: string, panel: StackPanel, clickFn: () => void) {
      const btn = Button.CreateSimpleButton("btn_" + text.slice(0, 5), text);
      panel.addControl(btn);
      btn.width = "50%";
      btn.height = "40px";
      btn.background = "green";
      btn.color = "white";
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      btn.onPointerClickObservable.add(clickFn);
    }

    addButton("Add impulse", panel, () => {
      instance.physicsBody?.applyImpulse(
        new Vector3(-1, 0, 0).scale(500),
        new Vector3(0, 0, 0)
      );
    });

    return scene;
  }
}
