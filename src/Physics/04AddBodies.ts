import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsViewer,
  Quaternion,
  Scene,
  ShadowGenerator,
  StandardMaterial,
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

export default class AddBodies {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Add Bodies";
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

    const dl = new DirectionalLight("dl", new Vector3(0, -1, -1));
    dl.autoCalcShadowZBounds = true;
    dl.intensity = 0.2;
    const sg = new ShadowGenerator(1024, dl);
    sg.bias = 0.01;
    sg.usePercentageCloserFiltering = true;

    camera.setPosition(new Vector3(0, 10, -30));

    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());
    const viewer = new PhysicsViewer();
    let showViewer = true;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 40,
      height: 40,
      subdivisions: 2,
    });
    ground.receiveShadows = true;
    sg.addShadowCaster(ground);
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

    const bodyRenderMat = new StandardMaterial("bodyRenderMat");
    bodyRenderMat.diffuseColor = new Color3(0.1, 0.3, 1);
    bodyRenderMat.ambientColor = new Color3(0.1, 0.1, 0.2);

    // body
    function addBody(pos: Vector3) {
      const box = MeshBuilder.CreateBox("box");
      box.position = pos;
      box.material = bodyRenderMat;
      sg.addShadowCaster(box);
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
    }
    addBody(new Vector3(0, 10, 0));

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

    const btn = Button.CreateSimpleButton("btn", "Add a body");
    panel.addControl(btn);
    btn.width = "50%";
    btn.height = "40px";
    btn.background = "green";
    btn.color = "white";
    btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btn.onPointerClickObservable.add(() => {
      addBody(new Vector3(0, 10, 0));
    });

    return scene;
  }
}
