import {
  ArcRotateCamera,
  CubeTexture,
  DistanceConstraint,
  Engine,
  HavokPlugin,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  Scene,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class SwingingPendulums {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Swinging Pendulums";
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

    camera.setPosition(new Vector3(-25, 0, 0));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    const cubeTex = new CubeTexture(
      "https://playground.babylonjs.com/textures/country.env",
      scene
    );
    const skybox = scene.createDefaultSkybox(cubeTex, true);

    const mat = new PBRMaterial("mat");
    const nb = 15;
    function distance(mat: PBRMaterial, n: number) {
      const box = MeshBuilder.CreateBox("box" + n);
      box.position = new Vector3(n - nb / 2, 1, 0);
      box.material = mat;

      const sphere = MeshBuilder.CreateSphere("sphere" + n);
      sphere.position = new Vector3(n - nb / 2, 1, -2);
      sphere.material = mat;

      const pendulumRod = MeshBuilder.CreateCylinder("pendulumRod" + n, {
        height: 3 + n / 2,
        diameter: 0.1,
        tessellation: 32,
      });

      const bag = new PhysicsAggregate(box, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 0.9,
      });
      const sag = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {
        mass: 1,
        restitution: 0.9,
      });

      const distanceJoint = new DistanceConstraint(3 + n / 2, scene);
      bag.body.addConstraint(sag.body, distanceJoint);
    }

    for (let i = 0; i < nb; i++) {
      distance(mat, i);
    }

    const defaultUp = new Vector3(0, 1, 0);
    scene.registerBeforeRender(() => {
      for (let i = 0; i < nb; i++) {
        const box = scene.getMeshByName("box" + i);
        const sphere = scene.getMeshByName("sphere" + i);
        const rope = scene.getMeshByName("pendulumRod" + i);
        if (!box || !sphere || !rope) return;

        const direction = box.position.subtract(sphere.position);
        direction.normalize();

        const rot = Quaternion.FromUnitVectorsToRef(
          defaultUp,
          direction,
          new Quaternion()
        );
        rope.rotationQuaternion = rot;

        const midp = box.position.add(sphere.position).scale(0.5);
        rope.position = midp;
      }
    });

    return scene;
  }
}
