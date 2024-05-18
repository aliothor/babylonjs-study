import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class CenterOfMass {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Center of Mass";
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

    camera.setPosition(new Vector3(0, 10, -20));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 40, height: 40 },
      scene
    );
    const groundShape = new PhysicsShapeBox(
      new Vector3(0, 0, 0),
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
    groundBody.setMassProperties({
      mass: 0,
      centerOfMass: new Vector3(0, 0, 0),
      inertia: new Vector3(1, 1, 1),
      inertiaOrientation: Quaternion.Identity(),
    });
    groundBody.shape = groundShape;

    function addBody(pos: Vector3, mass: number, centerOfMass: Vector3) {
      const box = MeshBuilder.CreateBox("box", {
        width: 1,
        depth: 1,
        height: 4,
      });
      box.position = pos;
      const boxMat = new StandardMaterial("boxMat");
      boxMat.diffuseColor = new Color3(0, 0, 1);
      boxMat.alpha = 0.8;
      box.material = boxMat;

      // physics
      const boxShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(1, 4, 1),
        scene
      );
      boxShape.material = { friction: 0.2, restitution: 0.3 };
      const boxBody = new PhysicsBody(
        box,
        PhysicsMotionType.DYNAMIC,
        false,
        scene
      );
      boxBody.setMassProperties({ mass, centerOfMass });
      boxBody.shape = boxShape;

      // display center of mass
      const centerOfMassIndicator = MeshBuilder.CreateSphere(
        "centerOfMassIndicator",
        {
          diameter: 0.2,
        }
      );
      centerOfMassIndicator.parent = box;
      centerOfMassIndicator.position = centerOfMass;
      centerOfMassIndicator.material = new StandardMaterial(
        "centerOfMassIndicatorMat"
      );
      centerOfMassIndicator.material.diffuseColor = new Color3(1, 0, 0);

      return box;
    }

    const bodies: Mesh[] = [];
    bodies.push(addBody(new Vector3(-4, 10, 0), 1, new Vector3(0, 0, 0)));
    bodies.push(addBody(new Vector3(0, 10, 0), 1, new Vector3(0, 2, 0)));
    bodies.push(addBody(new Vector3(4, 10, 0), 1, new Vector3(0, -2, 0)));

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const btn = Button.CreateSimpleButton("btn", "Push Bodies");
    adt.addControl(btn);
    btn.width = "150px";
    btn.height = "40px";
    btn.background = "green";
    btn.color = "white";
    btn.paddingLeftInPixels = 5;
    btn.paddingTopInPixels = 5;
    btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    btn.onPointerClickObservable.add(() => {
      for (let instance of bodies) {
        instance.physicsBody?.applyForce(
          new Vector3(0, 0, 1).scale(100),
          instance.position
        );
      }
    });

    return scene;
  }
}
