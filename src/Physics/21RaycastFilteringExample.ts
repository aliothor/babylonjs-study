import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Ray,
  RayHelper,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class RaycastFilteringExample {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Raycast Filtering Example";
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

    camera.setPosition(new Vector3(10, 5, -10));
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    function addMat(mesh: Mesh, color: Color3) {
      const mat = new StandardMaterial("mat" + Date.now());
      mat.diffuseColor = color;
      mat.specularColor = new Color3(0, 0, 0);
      mesh.material = mat;
    }

    const ground = MeshBuilder.CreateGround("ground", {
      width: 10,
      height: 10,
    });
    addMat(ground, new Color3(0.2, 0.2, 0.2));
    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });

    let useMesh = true;
    let shapeType = useMesh ? PhysicsShapeType.MESH : PhysicsShapeType.BOX;

    const box1 = MeshBuilder.CreateBox("box", { size: 2 });
    box1.position.y = 1;
    box1.position.z = 1;
    addMat(box1, new Color3(0.38, 0.75, 0.91));
    const bag1 = new PhysicsAggregate(box1, shapeType, { mass: 0 });

    const box2 = MeshBuilder.CreateBox("box", { size: 2 });
    box2.position.y = 1;
    box2.position.z = 4;
    addMat(box2, new Color3(0.38, 0.91, 0.46));
    const bag2 = new PhysicsAggregate(box2, shapeType, { mass: 0 });

    const ray0Origin = new Vector3(0, 1, -2);
    const ray1Dir = new Vector3(0.1, 0, 1);
    const ray1Len = 8;
    const ray1Dest = ray0Origin.add(ray1Dir.scale(ray1Len));

    const ray1 = new Ray(ray0Origin, ray1Dir, ray1Len);
    const ray1Helper = new RayHelper(ray1);
    ray1Helper.show(scene, new Color3(1, 1, 0));

    function makeSphere(position: Vector3, color: Color3) {
      const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 0.2,
        segments: 32,
      });
      sphere.position = position;
      addMat(sphere, color);
    }

    const sphereOg = makeSphere(ray0Origin, new Color3(0, 1, 0));
    const sphereDest = makeSphere(ray1Dest, new Color3(1, 0, 0));

    bag1.shape.filterMembershipMask = 1;
    bag2.shape.filterMembershipMask = 2;

    hk.executeStep(0.0016, []);
    // collide with
    // 1 test only the front box
    // 2 test only the back box
    // 3 test front and back boxes
    const collideWith = 2;
    const result = scene
      .getPhysicsEngine()
      ?.raycast(ray0Origin, ray1Dest, { collideWith });
    makeSphere(result?.hitPointWorld, new Color3(1, 1, 0));

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const txt = new TextBlock("txt");
    adt.addControl(txt);
    txt.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    txt.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    txt.color = "white";
    txt.text = `
    collidWith value: ${collideWith}
    hit: ${result?.hasHit}
    hit point: ${result?.hitPointWorld.toString()}
    hit distance: ${result?.hitDistance.toFixed(3)}
    hit triangle: ${result?.triangleIndex}
    `;

    return scene;
  }
}
