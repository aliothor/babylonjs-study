import {
  ArcRotateCamera,
  BallAndSocketConstraint,
  Color3,
  DistanceConstraint,
  DynamicTexture,
  Engine,
  HavokPlugin,
  HemisphericLight,
  HingeConstraint,
  LockConstraint,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Physics6DoFConstraint,
  PhysicsAggregate,
  PhysicsConstraintAxis,
  PhysicsShapeType,
  PrismaticConstraint,
  Scene,
  SliderConstraint,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
(globalThis as any).HK = await HavokPhysics();

export default class Constraints {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Constraints";
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

    camera.setPosition(new Vector3(0, 4, -20));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());

    function createLabel(position: Vector3, text: string) {
      const plane = MeshBuilder.CreatePlane("label" + text);
      plane.scaling.scaleInPlace(6);
      plane.position.copyFrom(position);
      plane.position.y += 2.5;
      plane.position.x += 1.4;
      plane.rotation.z += 1;
      const mat = new PBRMaterial("mat" + text);
      mat.backFaceCulling = false;
      mat.unlit = true;
      const dytex = new DynamicTexture("dytex" + text, 512, scene, true);
      dytex.hasAlpha = true;
      dytex.drawText(text, null, null, "64px Arial", "white", "transparent");
      mat.albedoTexture = dytex;
      mat.useAlphaFromAlbedoTexture = true;
      plane.material = mat;
    }

    function addMat(mesh: Mesh, col = null) {
      const mat = new StandardMaterial("mat");
      if (!col) {
        mat.diffuseColor = Color3.Random();
      } else {
        mat.diffuseColor = col;
      }
      mesh.material = mat;
    }

    function ballAndSocket() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = -8;
      box1.position.y = 1;
      box1.scaling.y = 0.2;
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position.x = -8;
      box2.position.y = 1;
      box2.position.z = -1;
      box2.scaling.y = 0.2;
      addMat(box2);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });

      const joint = new BallAndSocketConstraint(
        new Vector3(-0.5, 0, -0.5),
        new Vector3(-0.5, 0, 0.5),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "ball and socket");
    }

    function distance() {
      const sphere = MeshBuilder.CreateSphere("sphere");
      sphere.position.x = -6;
      sphere.position.y = 1;
      addMat(sphere);

      const box = MeshBuilder.CreateBox("box");
      box.position = new Vector3(-6, 1, -2);
      addMat(box);

      const sag = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, {
        mass: 0,
        restitution: 0.9,
      });
      const bax = new PhysicsAggregate(box, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 0.9,
      });

      const joint = new DistanceConstraint(2, scene);
      sag.body.addConstraint(bax.body, joint);
      createLabel(sphere.position, "distance");
    }

    function hinge() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = -4;
      box1.position.y = 1;
      box1.scaling.y = 0.2;
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position.x = -4;
      box2.position.y = 1;
      box2.position.z = -1;
      box2.scaling.y = 0.2;
      addMat(box2);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });

      const joint = new HingeConstraint(
        new Vector3(0, 0, -0.5),
        new Vector3(0, 0, 0.5),
        new Vector3(1, 0, 0),
        new Vector3(1, 0, 0),
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "hinge");
    }

    function prismatic() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = -2;
      box1.scaling = new Vector3(0.2, 3, 0.2);
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position = new Vector3(-2, 1.5, -0.2);
      box2.scaling = new Vector3(0.2, 0.5, 0.2);
      addMat(box2);

      const box3 = MeshBuilder.CreateBox("box3");
      box3.position = new Vector3(-2, -1.5, 0);
      box3.scaling = new Vector3(1.5, 0.1, 1.5);
      addMat(box3);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });
      const bag3 = new PhysicsAggregate(box3, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });

      const joint = new PrismaticConstraint(
        new Vector3(0, 0, -0.2),
        new Vector3(0, 0, 0.25),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "prismatic");
    }

    function locked() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = 0;
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position = new Vector3(0, 0, -2);
      box2.scaling = new Vector3(1.5, 1, 0.8);
      addMat(box2);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });

      const joint = new LockConstraint(
        new Vector3(0.5, 0.5, -0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1),
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "locked");
    }

    function slider() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = 2;
      box1.scaling = new Vector3(0.2, 3, 0.2);
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position = new Vector3(2, 1.5, -0.2);
      box2.scaling = new Vector3(0.2, 0.5, 0.2);
      addMat(box2);

      const box3 = MeshBuilder.CreateBox("box3");
      box3.position = new Vector3(2, -1.5, 0);
      box3.scaling = new Vector3(1.5, 0.1, 1.5);
      addMat(box3);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });
      const bag3 = new PhysicsAggregate(box3, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });

      const joint = new SliderConstraint(
        new Vector3(0, 0, -0.2),
        new Vector3(0, 0, 0.25),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "slider");
    }

    function sixdof() {
      const box1 = MeshBuilder.CreateBox("box1");
      box1.position.x = 4;
      addMat(box1);

      const box2 = MeshBuilder.CreateBox("box2");
      box2.position = new Vector3(4.2, 1.5, -0.2);
      addMat(box2);

      const bag1 = new PhysicsAggregate(box1, PhysicsShapeType.BOX, {
        mass: 0,
        restitution: 1,
      });
      const bag2 = new PhysicsAggregate(box2, PhysicsShapeType.BOX, {
        mass: 1,
        restitution: 1,
      });

      const joint = new Physics6DoFConstraint(
        {
          pivotA: new Vector3(0, -0.5, 0),
          pivotB: new Vector3(0, 0.5, 0),
          perpAxisA: new Vector3(1, 0, 0),
          perpAxisB: new Vector3(1, 0, 0),
        },
        [
          {
            axis: PhysicsConstraintAxis.LINEAR_DISTANCE,
            minLimit: 1,
            maxLimit: 2,
          },
        ],
        scene
      );

      bag1.body.addConstraint(bag2.body, joint);
      createLabel(box1.position, "6 dof");
    }

    ballAndSocket();
    distance();
    hinge();
    prismatic();
    locked();
    slider();
    sixdof();

    return scene;
  }
}
