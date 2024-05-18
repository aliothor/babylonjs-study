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

export default class BunnyRagdoll {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Bunny Ragdoll";
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
      "/Physics/bunny_rigged.glb"
    );
    const meshes = result.meshes;
    const skeleton = result.skeletons[0];
    skeleton.bones.forEach((b) => b.linkTransformNode(null));

    sg.addShadowCaster(meshes[1], true);

    const helper = scene.createDefaultEnvironment({ enableGroundShadow: true });
    helper!.ground!.position.y += 0.01;
    helper?.setMainColor(Color3.Gray());

    const config = [
      { bones: ["root"], size: 0.6, boxOffset: 0.1 },
      // Arms.
      {
        bones: ["arm_r", "arm_l"],
        depth: 0.3,
        size: 0.3,
        width: 0.6,
        rotationAxis: Axis.Z,
        min: -1,
        max: 1,
        boxOffset: 0.3,
        boneOffsetAxis: Axis.X,
      },
      // Legs
      {
        bones: ["leg_r", "leg_l"],
        depth: 0.5,
        size: 0.4,
        width: 0.8,
        rotationAxis: Axis.Z,
        min: -1,
        max: 1,
        boxOffset: 0.4,
        boneOffsetAxis: Axis.X,
      },
      //ears
      {
        bones: ["ear0_r", "ear0_l"],
        depth: 0.3,
        size: 1.1,
        height: 0.3,
        boxOffset: 0.6,
        boneOffsetAxis: Axis.X,
        min: -1,
        max: 1,
      },
      {
        bones: ["ear2_r", "ear2_l"],
        depth: 0.15,
        size: 1.5,
        height: 0.6,
        boxOffset: 0.7,
        boneOffsetAxis: Axis.X,
        min: -1,
        max: 1,
      },
      //head
      {
        bones: ["head"],
        size: 1.0,
        boxOffset: 0.5,
        boneOffsetAxis: Axis.X,
        min: -1,
        max: 1,
        rotationAxis: Axis.Z,
      },
    ];

    const ragdoll = new Ragdoll(skeleton, meshes[0], config);

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key == " ") {
          ragdoll.ragdoll();
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
