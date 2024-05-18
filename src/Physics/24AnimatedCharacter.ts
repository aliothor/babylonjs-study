import {
  ArcRotateCamera,
  Axis,
  Color3,
  DirectionalLight,
  Engine,
  HavokPlugin,
  HemisphericLight,
  KeyboardEventTypes,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsViewer,
  Ragdoll,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import "babylonjs-loaders";
import HavokPhsycis from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhsycis();

export default class AnimatedCharacter {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Animated Character";
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
    camera.alpha = Math.PI / 2;
    const dl = new DirectionalLight("dl", new Vector3(-1, -0.5, -1));
    dl.position = new Vector3(3, 6, 4);
    const sg = new ShadowGenerator(1024, dl);
    sg.useBlurExponentialShadowMap = true;
    sg.blurKernel = 32;

    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );
    ground.receiveShadows = true;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });

    const result = await SceneLoader.ImportMeshAsync(
      "",
      "/Physics/funnyGuy.glb"
    );
    const meshes = result.meshes;
    const skeleton = result.skeletons[0];
    sg.addShadowCaster(meshes[0], true);
    scene.beginAnimation(skeleton, 0, 10, true, 1);

    const helper = scene.createDefaultEnvironment({ enableGroundShadow: true });
    helper!.ground!.position.y += 0.01;
    helper?.setMainColor(Color3.Gray());

    const config = [
      { bones: ["mixamorig:Hips"], size: 0.25, boxOffset: 0.01 },
      {
        bones: ["mixamorig:Spine2"],
        size: 0.2,
        boxOffset: 0.05,
        boneOffsetAxis: Axis.Y,
        min: -1,
        max: 1,
        rotationAxis: Axis.Z,
      },
      // Arms.
      {
        bones: ["mixamorig:LeftArm", "mixamorig:RightArm"],
        depth: 0.1,
        size: 0.1,
        width: 0.2,
        rotationAxis: Axis.Y,
        //min: -1,
        //max: 1,
        boxOffset: 0.1,
        boneOffsetAxis: Axis.Y,
      },
      {
        bones: ["mixamorig:LeftForeArm", "mixamorig:RightForeArm"],
        depth: 0.1,
        size: 0.1,
        width: 0.2,
        rotationAxis: Axis.Y,
        min: -1,
        max: 1,
        boxOffset: 0.12,
        boneOffsetAxis: Axis.Y,
      },
      // Legs
      {
        bones: ["mixamorig:LeftUpLeg", "mixamorig:RightUpLeg"],
        depth: 0.1,
        size: 0.2,
        width: 0.08,
        rotationAxis: Axis.Y,
        min: -1,
        max: 1,
        boxOffset: 0.2,
        boneOffsetAxis: Axis.Y,
      },
      {
        bones: ["mixamorig:LeftLeg", "mixamorig:RightLeg"],
        depth: 0.08,
        size: 0.3,
        width: 0.1,
        rotationAxis: Axis.Y,
        min: -1,
        max: 1,
        boxOffset: 0.2,
        boneOffsetAxis: Axis.Y,
      },
      {
        bones: ["mixamorig:LeftHand", "mixamorig:RightHand"],
        depth: 0.2,
        size: 0.2,
        width: 0.2,
        rotationAxis: Axis.Y,
        min: -1,
        max: 1,
        boxOffset: 0.1,
        boneOffsetAxis: Axis.Y,
      },
      //head
      {
        bones: ["mixamorig:Head"],
        size: 0.7,
        boxOffset: 0.3,
        boneOffsetAxis: Axis.Y,
        min: -1,
        max: 1,
        rotationAxis: Axis.Z,
      },
    ];

    const rootNode = scene.getTransformNodeByName("Boy_01_Meshes")!;
    const ragdoll = new Ragdoll(skeleton, rootNode, config);

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key == " ") {
          ragdoll.ragdoll();
        }
        if (kbInfo.event.key == "f") {
          ragdoll
            .getAggregate(0)
            .body.applyImpulse(
              new Vector3(200, 200, 200),
              Vector3.ZeroReadOnly
            );
        }
      }
    });

    const viewer = new PhysicsViewer();
    scene.transformNodes.forEach((m) => {
      if (m.physicsBody) {
        viewer.showBody(m.physicsBody);
      }
    });

    return scene;
  }
}
