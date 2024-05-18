import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Matrix,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsHelper,
  PhysicsRadialImpulseFalloff,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  StackPanel,
} from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class PhysicsHelpersExample {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Physics Helpers";
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

    camera.setPosition(new Vector3(0, 24, -64));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const physicsHelper = new PhysicsHelper(scene);
    const ground = MeshBuilder.CreateGround("ground", {
      width: 64,
      height: 64,
      subdivisions: 2,
    });
    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
      mass: 0,
      friction: 0.2,
      restitution: 0.3,
    });

    let boxMatrix = Matrix.Identity();
    function createBoxes() {
      const boxSize = 2;
      const boxPadding = 4;
      const box = MeshBuilder.CreateBox("box", { size: boxSize });
      const mat = new StandardMaterial("mat");
      mat.diffuseColor = Color3.Red();
      box.material = mat;

      let matrixArray = [];
      for (let x = -12; x <= 12; x += boxSize + boxPadding) {
        for (let z = -12; z <= 12; z += boxSize + boxPadding) {
          for (let y = 1; y <= 8; y += boxSize) {
            boxMatrix.setTranslationFromFloats(x, y, z);
            matrixArray.push(boxMatrix.clone());
          }
        }
      }

      const buffer = new Float32Array(matrixArray.length * 16);
      for (let i = 0; i < matrixArray.length; i++) {
        matrixArray[i].copyToArray(buffer, i * 16);
      }
      box.thinInstanceSetBuffer("matrix", buffer, 16, false);

      const bag = new PhysicsAggregate(box, PhysicsShapeType.BOX, {
        mass: 2,
        friction: 0.2,
        restitution: 0.3,
      });
      box.metadata = { bag };
    }

    createBoxes();

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel();
    adt.addControl(panel);
    panel.width = "200px";
    panel.adaptHeightToChildren = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    function addButton(parent: StackPanel, text: string, fn: () => void) {
      const btn = Button.CreateSimpleButton("btn", text);
      parent.addControl(btn);
      btn.width = "100%";
      btn.height = "40px";
      btn.background = "green";
      btn.color = "white";
      btn.onPointerClickObservable.add(fn);
    }

    const radius = 8;
    const strength = 20;

    addButton(panel, "Radial Explosion", () => {
      const origins = [new Vector3(-8, 6, 0), new Vector3(0, 0, 0)];
      for (let i = 0; i < origins.length; i++) {
        setTimeout(() => {
          const event = physicsHelper.applyRadialExplosionImpulse(
            origins[i],
            radius,
            strength,
            PhysicsRadialImpulseFalloff.Linear
          );

          const sphere = MeshBuilder.CreateSphere("debug", {
            diameter: radius * 2,
          });
          sphere.position = origins[i].clone();
          sphere.visibility = 0.5;

          setTimeout(() => {
            sphere.dispose();
            event?.dispose();
          }, 1500);
        }, i * 2000 + 1000);
      }
    });

    addButton(panel, "Gravitational Field", () => {
      const origin = new Vector3(0, 6, 10);
      setTimeout(() => {
        const event = physicsHelper.gravitationalField(
          origin,
          radius,
          strength,
          PhysicsRadialImpulseFalloff.Linear
        );
        event?.enable();

        const sphere = MeshBuilder.CreateSphere("debug", {
          diameter: radius * 2,
        });
        sphere.position = origin.clone();
        sphere.visibility = 0.5;

        setTimeout(() => {
          sphere.dispose();
          event?.disable();
          event?.dispose();
        }, 3000);
      }, 1000);
    });

    addButton(panel, "Updraft", () => {
      const origin = new Vector3(10, 0, 10);
      setTimeout(() => {
        const event = physicsHelper.updraft(origin, radius, strength / 4, 20);
        event?.enable();

        const cylinder = MeshBuilder.CreateCylinder("debug", {
          diameter: 20,
          height: 24,
        });
        cylinder.position = origin.add(new Vector3(0, 10, 0));
        cylinder.visibility = 0.5;

        setTimeout(() => {
          event?.disable();
          event?.dispose();
          cylinder.dispose();
        }, 2000);
      }, 1000);
    });

    addButton(panel, "Vortex", () => {
      const origin = new Vector3(0, -8, 0);
      setTimeout(() => {
        const event = physicsHelper.vortex(origin, 20, 40, 30);
        event?.enable();

        const cylinder = MeshBuilder.CreateCylinder("debug", {
          diameter: 30,
          height: 40,
        });
        cylinder.position = origin.add(new Vector3(0, 15, 0));
        cylinder.visibility = 0.5;

        setTimeout(() => {
          event?.disable();
          event?.dispose();
          cylinder.dispose();
        }, 10000);
      }, 1000);
    });

    addButton(panel, "Restart Scene", () => {
      for (let mesh of scene.meshes) {
        if (mesh.name.startsWith("box")) {
          if (mesh.metadata && mesh.metadata.bag) {
            mesh.metadata.bag.dispose();
            mesh.metadata.bag = null;
          }
          mesh.dispose();
        }
      }
      createBoxes();
    });

    return scene;
  }
}
