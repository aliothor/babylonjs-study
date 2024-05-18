import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsRaycastResult,
  PhysicsShapeType,
  Ray,
  RayHelper,
  Scene,
  SceneInstrumentation,
  StandardMaterial,
  Vector3,
  Viewport,
  WebGPUEngine,
} from "babylonjs";
import HavokPhsycis from "@babylonjs/havok";
import {
  AdvancedDynamicTexture,
  Checkbox,
  Control,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";
(globalThis as any).HK = await HavokPhsycis();

export default class RaypickingRaycast {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Raypicking and Raycast";
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
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);
    const physicEngine = scene.getPhysicsEngine();

    const width = 30;
    const height = 10;
    const depth = 10;
    const blockSize = 2;
    const size = Math.max(width, height) * blockSize;

    camera.alpha = 1;
    camera.beta = 1;
    camera.radius = size * 3;

    const cam2 = new ArcRotateCamera(
      "cam2",
      0.2,
      Math.PI / 2.5,
      25,
      new Vector3(0, 0, 0)
    );
    cam2.viewport = new Viewport(0.75, 0.75, 0.25, 0.25);
    cam2.radius = size * 2;
    cam2.target.y = size / 2;
    scene.activeCameras?.push(cam2);
    scene.activeCameras?.push(camera);
    scene.cameraToUseForPointers = camera;

    const ground = MeshBuilder.CreateGround("ground", {
      width: size * 2,
      height: size,
    });
    ground.isPickable = false;
    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      restitution: 0,
    });

    const baseBlock = MeshBuilder.CreateCylinder("baseBlock", {
      diameter: blockSize,
      height: blockSize,
      subdivisions: 10,
      tessellation: 40,
    });
    const total = width * height * depth;

    const matrixBuffer = new Float32Array(total * 16);
    const colorBuffer = new Float32Array(total * 4);
    const matrix = Matrix.Identity();

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        for (let k = 0; k < depth; k++) {
          const index = i + j * width + k * width * height;
          matrix.setTranslationFromFloats(
            (i - width / 2) * blockSize,
            j * blockSize + blockSize / 2,
            (k - depth / 2) * blockSize
          );
          matrix.copyToArray(matrixBuffer, index * 16);

          colorBuffer[index * 4 + 0] = Math.random();
          colorBuffer[index * 4 + 1] = Math.random();
          colorBuffer[index * 4 + 2] = Math.random();
          colorBuffer[index * 4 + 3] = 1;
        }
      }
    }
    baseBlock.thinInstanceSetBuffer("matrix", matrixBuffer, 16);
    baseBlock.thinInstanceSetBuffer("color", colorBuffer, 4);

    new PhysicsAggregate(baseBlock, PhysicsShapeType.CYLINDER, {
      mass: 1,
      restitution: 0,
    });

    let useRaycast = false;
    function enablePickingBaseOnRaycast(baseBlock: Mesh, useRaycast: boolean) {
      baseBlock.isPickable = !useRaycast;
      baseBlock.thinInstanceEnablePicking = !useRaycast;
      scene.skipPointerMovePicking = useRaycast;
    }
    enablePickingBaseOnRaycast(baseBlock, useRaycast);

    const indicatorPoint = MeshBuilder.CreateSphere("indicatorPoint", {
      diameter: 2,
    });
    indicatorPoint.isVisible = false;
    indicatorPoint.isPickable = false;
    const indicatorPointMat = new StandardMaterial("indicatorPointMat");
    indicatorPointMat.emissiveColor = new Color3(0, 1, 0);
    indicatorPointMat.alpha = 0.7;
    indicatorPoint.material = indicatorPointMat;

    const pickingRay = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
    const rayHelper = new RayHelper(pickingRay);
    rayHelper.show(scene);
    let raycastResut = new PhysicsRaycastResult();

    scene.onPointerMove = (e, pickInfo) => {
      let hit = false;
      let hitPos = new Vector3(0, 0, 0);
      if (useRaycast) {
        scene.createPickingRayToRef(
          scene.pointerX,
          scene.pointerY,
          null,
          pickingRay,
          camera
        );
        raycastResut = physicEngine!.raycast(
          pickingRay.origin,
          pickingRay.origin.add(pickingRay.direction.scale(10000))
        );
        hit = raycastResut.hasHit;
        hitPos = raycastResut.hitPointWorld;
      } else {
        const pInfo = scene.pick(scene.pointerX, scene.pointerY);
        hit = pInfo.hit;
        hitPos = pInfo.pickedPoint!;
      }
      if (hit) {
        indicatorPoint.isVisible = true;
        indicatorPoint.position.copyFrom(hitPos);
      }
    };

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
    viewerCheckbox.isChecked = useRaycast;
    viewerCheckbox.color = "green";
    viewerCheckbox.onIsCheckedChangedObservable.add((value) => {
      useRaycast = value;
      enablePickingBaseOnRaycast(baseBlock, useRaycast);
    });

    const checkboxText = new TextBlock("checkboxText", "Use Raycast");
    toggleViewLine.addControl(checkboxText);
    checkboxText.resizeToFit = true;
    checkboxText.color = "white";

    function addText(parent: StackPanel, updateFn: (t: TextBlock) => void) {
      const txt = new TextBlock("txt");
      parent.addControl(txt);
      txt.resizeToFit = true;
      txt.color = "white";
      txt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      scene.onAfterRenderObservable.add(() => updateFn(txt));
      return txt;
    }

    const sceneInstrumetation = new SceneInstrumentation(scene);
    sceneInstrumetation.captureFrameTime = true;
    sceneInstrumetation.capturePhysicsTime = true;

    addText(panel, (txt) => {
      txt.text = `FPS: ${scene.getEngine().getFps().toFixed(2)}`;
    });

    addText(panel, (txt) => {
      txt.text = `Physics FPS: ${(
        1000 / sceneInstrumetation.frameTimeCounter.lastSecAverage
      ).toFixed(2)}`;
    });

    addText(panel, (txt) => {
      txt.text = `Physics time: ${sceneInstrumetation.physicsTimeCounter.lastSecAverage.toFixed(
        2
      )}`;
    });

    return scene;
  }
}
