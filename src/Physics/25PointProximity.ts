import {
  Animation,
  ArcRotateCamera,
  Color3,
  Curve3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Matrix,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  ProximityCastResult,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class PointProximity {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Point Proximity";
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
    camera.setPosition(new Vector3(100, 80, -200));
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    const width = 200;
    const height = 200;
    const blockSize = 4;
    const ballSize = 2;

    const ground = MeshBuilder.CreateGround("ground", { width, height }, scene);
    const ball = MeshBuilder.CreateSphere("ball", { diameter: ballSize });

    const splinePoints = [
      new Vector3(-width / 4, ballSize / 4, -height / 4),
      new Vector3(width / 4, ballSize / 4, -height / 4),
      new Vector3(width / 4, ballSize / 4, height / 4),
      new Vector3(-width / 4, ballSize / 4, height / 4),
    ];

    const catmullRom = Curve3.CreateCatmullRomSpline(splinePoints, 60, true);
    const catmullPoints = catmullRom.getPoints();
    MeshBuilder.CreateLines("catmullRom", { points: catmullPoints });

    // animations
    const keys = [];
    const totalFrames = 480;
    for (let i = 0; i < catmullPoints.length; i++) {
      keys.push({
        frame: (i / catmullPoints.length) * totalFrames,
        value: catmullPoints[i],
      });
    }
    const anim = new Animation(
      "mov",
      "position",
      60,
      Animation.ANIMATIONTYPE_VECTOR3
    );
    anim.setKeys(keys);
    scene.beginDirectAnimation(ball, [anim], 0, totalFrames, true);

    const baseBlock = MeshBuilder.CreateCylinder("baseBlock", {
      diameter: blockSize,
      height: blockSize,
      subdivisions: 10,
      tessellation: 40,
    });

    const total = 100;
    const matrixBuffer = new Float32Array(total * 16);
    const colorBuffer = new Float32Array(total * 4);
    const matrix = Matrix.Identity();

    for (let i = 0; i < total; i++) {
      matrix.setTranslationFromFloats(
        (Math.random() - 0.5) * width,
        blockSize / 2,
        (Math.random() - 0.5) * height
      );
      matrix.copyToArray(matrixBuffer, i * 16);

      colorBuffer[i * 4 + 0] = Math.random();
      colorBuffer[i * 4 + 1] = Math.random();
      colorBuffer[i * 4 + 2] = Math.random();
      colorBuffer[i * 4 + 3] = 1;
    }
    baseBlock.thinInstanceSetBuffer("matrix", matrixBuffer, 16);
    baseBlock.thinInstanceSetBuffer("color", colorBuffer, 4);

    new PhysicsAggregate(baseBlock, PhysicsShapeType.CYLINDER, {
      mass: 0,
      restitution: 0,
    });

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 20 });
    sphere.parent = ball;
    const sMat = new StandardMaterial("sMat");
    sMat.diffuseColor = new Color3(0, 1, 0);
    sMat.alpha = 0.6;
    sphere.material = sMat;

    const highlightCylinder = MeshBuilder.CreateCylinder("highlightCylinder", {
      diameter: blockSize * 1.5,
      height: blockSize * 1.5,
    });
    const hlsMat = new StandardMaterial("hlsMat");
    hlsMat.emissiveColor = new Color3(1, 1, 1);
    highlightCylinder.material = hlsMat;

    const result = new ProximityCastResult();
    scene.onBeforeRenderObservable.add(() => {
      hk.pointProximity(
        {
          position: ball.absolutePosition,
          maxDistance: 10,
          collisionFilter: { membership: 0xfff, collideWith: 0xfff },
          shouldHitTriggers: false,
        },
        result
      );

      if (result.hasHit) {
        const bodyIndex = result.bodyIndex!;
        highlightCylinder.position.set(
          matrixBuffer[bodyIndex * 16 + 12],
          matrixBuffer[bodyIndex * 16 + 13],
          matrixBuffer[bodyIndex * 16 + 14]
        );
      }
    });

    return scene;
  }
}
