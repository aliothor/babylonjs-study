import {
  ArcRotateCamera,
  Color3,
  DynamicTexture,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import { AdvancedDynamicTexture, Button } from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class SleepMode {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Sleep Mode";
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
    light.intensity = 0.9;

    camera.setPosition(new Vector3(0, 3, -15));
    camera.setTarget(new Vector3(0, 3, 0));

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );

    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -1, 0), hk);

    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
    });

    function createBoxes(
      size: number,
      num: number,
      startAsleep: boolean,
      pos: Vector3,
      yOffset: number
    ) {
      for (let i = 0; i < num; i++) {
        const box = MeshBuilder.CreateBox("box", { size });
        const mat = new StandardMaterial("mat");
        mat.diffuseColor = Color3.Random();
        box.material = mat;
        box.position = pos.clone();
        box.position.y += i * (yOffset + size) + 0.5;
        new PhysicsAggregate(box, PhysicsShapeType.BOX, {
          mass: 1,
          startAsleep,
        });
      }
    }

    createBoxes(1, 3, true, new Vector3(-2, 0, 0), 0.5);
    createBoxes(1, 3, false, new Vector3(2, 0, 0), 0.5);

    function createLabel(pos: Vector3, text: string) {
      const dynamicTexture = new DynamicTexture(
        "dynamicTexture" + text,
        512,
        scene,
        true
      );
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(
        text,
        null,
        null,
        "32px Arial",
        "white",
        "transparent"
      );

      const plane = MeshBuilder.CreatePlane("plane", { size: 2 }, scene);
      plane.scaling.scaleInPlace(3);
      plane.position.copyFrom(pos);
      plane.rotation.z += 1;
      const pMat = new PBRMaterial("pMat");
      pMat.unlit = true;
      pMat.backFaceCulling = false;
      pMat.albedoTexture = dynamicTexture;
      pMat.useAlphaFromAlbedoTexture = true;
      plane.material = pMat;
    }

    createLabel(new Vector3(-1.5, 6, 0), "Start asleep");
    createLabel(new Vector3(2.5, 6, 1), "Start awake");

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const btn = Button.CreateSimpleButton("btn", "Drop object on towers");
    adt.addControl(btn);
    btn.widthInPixels = 300;
    btn.heightInPixels = 40;
    btn.background = "green";
    btn.color = "white";
    btn.top = "-40%";
    btn.onPointerClickObservable.add(() => {
      createBoxes(0.2, 1, false, new Vector3(-2, 5, 0), 0);
      createBoxes(0.2, 1, false, new Vector3(2, 5, 0), 0);
    });

    return scene;
  }
}
