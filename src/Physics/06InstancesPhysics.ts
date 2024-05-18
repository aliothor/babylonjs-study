import {
  ArcRotateCamera,
  DirectionalLight,
  DistanceConstraint,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Matrix,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsViewer,
  Quaternion,
  Scene,
  ShadowGenerator,
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

export default class InstancesPhysics {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Instances Physics";
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
    let showViewer = false;

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

    // body
    function addInstance(pos: Vector3) {
      const box = MeshBuilder.CreateBox("box");
      sg.addShadowCaster(box);

      // layout
      const numPerSize = 2;
      const size = 2;
      const ofst = 2;
      const instancCount = numPerSize * numPerSize * numPerSize;

      let m = Matrix.Identity();
      const rm = Matrix.Identity();
      const r = Quaternion.Identity();
      const ridx = [0, 1, 2, 4, 5, 6, 8, 9, 10];
      let index = 0;
      const matricesData = new Float32Array(instancCount * 16);
      const colorsData = new Float32Array(instancCount * 4);

      for (let x = 0; x < numPerSize; x++) {
        m.m[12] = -size / 2 + ofst * x + pos.x;
        for (let y = 0; y < numPerSize; y++) {
          m.m[13] = -size / 2 + ofst * y + pos.y;
          for (let z = 0; z < numPerSize; z++) {
            m.m[14] = -size / 2 + ofst * z + pos.z;

            const xr = Math.random() * Math.PI;
            const yr = Math.random() * Math.PI;
            const zr = Math.random() * Math.PI;
            Quaternion.FromEulerAnglesToRef(xr, yr, zr, r);
            r.toRotationMatrix(rm);
            for (let i of ridx) {
              m.m[i] = rm.m[i];
            }
            m.copyToArray(matricesData, index * 16);

            // color
            colorsData[index * 4 + 0] = 0;
            colorsData[index * 4 + 1] = 0;
            colorsData[index * 4 + 2] = 1;
            colorsData[index * 4 + 3] = 1;

            index++;
          }
        }
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

    addButton("Add instance", panel, () => {
      const posMatrix = Matrix.Identity();
      posMatrix.setTranslationFromFloats(0, 10, 0);
      instance.thinInstanceAdd(posMatrix);

      const color = [Math.random(), Math.random(), Math.random(), 1];
      instance.thinInstanceSetAttributeAt(
        "color",
        instance.thinInstanceCount - 1,
        color
      );
    });

    addButton("Remove instance", panel, () => {
      instance.thinInstanceCount--;
    });

    addButton("Synchronize", panel, () => {
      instance.physicsBody?.updateBodyInstances();
    });

    const forceValue = new Vector3(0, 200, 0);
    addButton("Apply force up to all instances", panel, () => {
      instance.physicsBody?.applyForce(forceValue, Vector3.Zero());
    });

    function getRndIdx() {
      return Math.floor(Math.random() * instance.thinInstanceCount);
    }

    addButton("Apply force to random instance", panel, () => {
      const idx = getRndIdx();
      instance.physicsBody?.applyForce(forceValue, Vector3.Zero(), idx);
    });

    const maxMass = 10;
    addButton("Randomize mass", panel, () => {
      const nInstance = instance.thinInstanceCount;
      for (let i = 0; i < nInstance; i++) {
        const mass = Math.floor(Math.random() * (maxMass - 1)) + 1;
        instance.physicsBody?.setMassProperties({ mass }, i);
      }
    });

    addButton("Add constraint between two random instances", panel, () => {
      const idxA = getRndIdx();
      let idxB = getRndIdx();
      while (idxB === idxA) {
        idxB = getRndIdx();
      }
      const distanceJoint = new DistanceConstraint(2, scene);
      instance.physicsBody?.addConstraint(
        instance.physicsBody,
        distanceJoint,
        idxA,
        idxB
      );
      const pairColor = [Math.random(), Math.random(), Math.random(), 1];
      instance.thinInstanceSetAttributeAt("color", idxA, pairColor);
      instance.thinInstanceSetAttributeAt("color", idxB, pairColor);
    });

    addButton("Randomize motion type", panel, () => {
      const nInstance = instance.thinInstanceCount;
      for (let i = 0; i < nInstance; i++) {
        const montionType =
          Math.random() > 0.5
            ? PhysicsMotionType.DYNAMIC
            : PhysicsMotionType.STATIC;
        instance.physicsBody?.setMotionType(montionType, i);
      }
    });

    return scene;
  }
}
