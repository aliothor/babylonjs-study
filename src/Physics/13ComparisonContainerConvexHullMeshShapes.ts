import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShape,
  PhysicsShapeBox,
  PhysicsShapeCapsule,
  PhysicsShapeContainer,
  PhysicsShapeConvexHull,
  PhysicsShapeCylinder,
  PhysicsShapeMesh,
  PhysicsShapeSphere,
  PhysicsShapeType,
  PhysicsViewer,
  Quaternion,
  Scene,
  SceneLoader,
  ShadowGenerator,
  StandardMaterial,
  Tools,
  TransformNode,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import "babylonjs-loaders";
import HavokPhysics, { Result } from "@babylonjs/havok";
import {
  AdvancedDynamicTexture,
  Button,
  Checkbox,
  Control,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class ComparisonContainerConvexHullMeshShapes {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Comparison of using Container, Convex Hull and Mesh Shapes on different meshes";
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

    const dl = new DirectionalLight("dl", new Vector3(0, -1, 1));
    dl.autoCalcShadowZBounds = true;
    dl.intensity = 0.2;

    const shadowGen = new ShadowGenerator(1024, dl);

    camera.setPosition(new Vector3(0, 5, -15));
    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin());
    const viewer = new PhysicsViewer();

    let showViewer = false;
    const colorMeshShape = Color3.FromHexString("#db504a");
    const colorHullShape = Color3.FromHexString("#e3b505");
    const colorAggregateShape = Color3.FromHexString("#56a3a6");

    const ground = MeshBuilder.CreateGround("ground", {
      width: 40,
      height: 40,
    });
    ground.receiveShadows = true;
    const gag = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });
    if (showViewer) {
      viewer.showBody(gag.body);
    }

    function bindBodyShape(
      mesh: Mesh,
      shape: PhysicsShape,
      color: Color3 = Color3.Red()
    ) {
      const mat = new StandardMaterial("mat");
      mat.diffuseColor = color;
      if (mesh.getClassName() == "Mesh") {
        mesh.material = mat;
      }
      if (mesh.getDescendants && mesh.getDescendants.length) {
        mesh.getDescendants<Mesh>().forEach((m) => {
          m.material = mat;
        });
      }

      shape.material = { friction: 0.2, restitution: 0 };
      const body = new PhysicsBody(
        mesh,
        PhysicsMotionType.DYNAMIC,
        false,
        scene
      );
      body.shape = shape;
      body.setMassProperties({ mass: 1 });
    }

    function bindAndShowBody(body: Mesh, shape: PhysicsShape, color: Color3) {
      if (body.getClassName() == "Mesh") {
        shadowGen.addShadowCaster(body);
      } else {
        body.getChildMeshes().forEach((m) => {
          shadowGen.addShadowCaster(m);
        });
      }
      bindBodyShape(body, shape, color);

      if (showViewer && body.physicsBody) {
        viewer.showBody(body.physicsBody);
      }
    }

    const url = "https://playground.babylonjs.com/scenes/";
    // seagull
    async function seagullBody() {
      const seagullResult = await SceneLoader.ImportMeshAsync(
        "",
        url,
        "seagulf.glb"
      );
      const sg1 = seagullResult.meshes[1] as Mesh;
      sg1.parent = null;
      sg1.position = Vector3.Zero();
      sg1.normalizeToUnitCube();
      sg1.scaling.scaleInPlace(3);

      const sg2 = sg1.clone("sg2", null);
      const sg3 = sg1.clone("sg3", null);

      const root = new Mesh("seagull-root");
      sg3.parent = root;

      sg1.position = new Vector3(0, 2, 10);
      sg2.position = new Vector3(2, 2, 10);
      root.position = new Vector3(4, 2, 10);

      // mesh shape
      const sg1Shape = new PhysicsShapeMesh(sg1, scene);
      bindAndShowBody(sg1, sg1Shape, colorMeshShape);

      // Convex hull
      const sg2Shape = new PhysicsShapeConvexHull(sg2, scene);
      bindAndShowBody(sg2, sg2Shape, colorHullShape);

      // Aggregate
      const cyl1 = MeshBuilder.CreateCylinder("cyl1", {
        height: 0.9,
        diameter: 0.7,
      });
      cyl1.position = new Vector3(0, 2.5, 0.28);
      cyl1.parent = root;
      cyl1.isVisible = false;
      const cyl2 = MeshBuilder.CreateCylinder("cyl2", {
        height: 0.5,
        diameter: 0.25,
      });
      cyl2.position = new Vector3(0.01, 2.45, 0.9);
      cyl2.rotation.x = Math.PI / 2;
      cyl2.parent = root;
      cyl2.isVisible = false;

      const sph1 = MeshBuilder.CreateSphere("sph1", { diameter: 1 });
      sph1.position = new Vector3(0, 1.5, 0.1);
      sph1.parent = root;
      sph1.isVisible = false;
      const cyl3 = MeshBuilder.CreateCylinder("cyl3", {
        height: 0.7,
        diameter: 0.3,
      });
      cyl3.position = new Vector3(0, 1.4, -0.7);
      cyl3.rotation.x = Math.PI / 2;
      cyl3.parent = root;
      cyl3.isVisible = false;
      const cyl4 = MeshBuilder.CreateCylinder("cyl3", {
        height: 1.1,
        diameter: 0.5,
      });
      cyl4.position = new Vector3(0, 0.55, 0.25);
      cyl4.parent = root;
      cyl4.isVisible = false;

      const cyl1Shape = new PhysicsShapeCylinder(
        new Vector3(0, -0.45, 0),
        new Vector3(0, 0.45, 0),
        0.35,
        scene
      );
      const cyl2Shape = new PhysicsShapeCylinder(
        new Vector3(0, -0.25, 0),
        new Vector3(0, 0.25, 0),
        0.125,
        scene
      );
      const sph1Shape = new PhysicsShapeSphere(
        new Vector3(0, 0, 0),
        0.5,
        scene
      );
      const cyl3Shape = new PhysicsShapeCylinder(
        new Vector3(0, -0.35, 0),
        new Vector3(0, 0.35, 0),
        0.15,
        scene
      );
      const cyl4Shape = new PhysicsShapeCylinder(
        new Vector3(0, -0.55, 0),
        new Vector3(0, 0.55, 0),
        0.25,
        scene
      );

      const rs = new PhysicsShapeContainer(scene);
      rs.addChildFromParent(root, cyl1Shape, cyl1);
      rs.addChildFromParent(root, cyl2Shape, cyl2);
      rs.addChildFromParent(root, sph1Shape, sph1);
      rs.addChildFromParent(root, cyl3Shape, cyl3);
      rs.addChildFromParent(root, cyl4Shape, cyl4);
      bindAndShowBody(root, rs, colorAggregateShape);
    }

    async function bunnyBody() {
      const bunnyResult = await SceneLoader.ImportMeshAsync(
        "",
        url,
        "StanfordBunny.obj"
      );
      const bunny1 = bunnyResult.meshes[0] as Mesh;
      bunny1.parent = null;
      bunny1.position = Vector3.Zero();
      bunny1.normalizeToUnitCube();

      const bunny2 = bunny1.clone("bn2", null);
      const bunny3 = bunny1.clone("bn3", null);

      const root = new Mesh("bunny-root");
      bunny3.parent = root;

      bunny1.position = new Vector3(0, 2, 5);
      bunny2.position = new Vector3(2, 2, 5);
      root.position = new Vector3(4, 2, 5);

      // mesh shape
      const bunny1Shape = new PhysicsShapeMesh(bunny1, scene);
      bindAndShowBody(bunny1, bunny1Shape, colorMeshShape);

      // Convex hull
      const bunny2Shape = new PhysicsShapeConvexHull(bunny2, scene);
      bindAndShowBody(bunny2, bunny2Shape, colorHullShape);

      // Aggregate
      const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.65 });
      sphere.position = new Vector3(-0.1, 0.35, 0);
      sphere.parent = root;
      sphere.isVisible = false;

      const cp = MeshBuilder.CreateCapsule("cp", {
        height: 0.8,
        radiusBottom: 0.2,
        radiusTop: 0.2,
      });
      cp.position = new Vector3(-0.38, 0.7, -0.1);
      cp.rotation = new Vector3(
        Tools.ToRadians(57),
        Tools.ToRadians(152),
        Tools.ToRadians(0)
      );
      cp.parent = root;
      cp.isVisible = false;

      const cpPointA = new Vector3(0, -0.2, 0);
      const cpPointB = new Vector3(0, 0.2, 0);
      const sphereShape = new PhysicsShapeSphere(
        new Vector3(0, 0, 0),
        0.65 / 2,
        scene
      );
      const cpShape = new PhysicsShapeCapsule(cpPointA, cpPointB, 0.2, scene);

      const bunnyShape = new PhysicsShapeContainer(scene);
      bunnyShape.addChildFromParent(root, sphereShape, sphere);
      bunnyShape.addChildFromParent(root, cpShape, cp);

      bindAndShowBody(root, bunnyShape, colorAggregateShape);
    }

    async function skullBody() {
      const bunnyResult = await SceneLoader.ImportMeshAsync(
        "",
        url,
        "skull.babylon"
      );
      const skull1 = bunnyResult.meshes[0] as Mesh;
      skull1.parent = null;
      skull1.position = Vector3.Zero();
      skull1.normalizeToUnitCube();

      const skull2 = skull1.clone("sk2", null);
      const skull3 = skull1.clone("sk3", null);

      const root = new Mesh("skull-root");
      skull3.parent = root;

      skull1.position = new Vector3(0, 2, 0);
      skull2.position = new Vector3(2, 2, 0);
      root.position = new Vector3(4, 2, 0);

      // mesh shape
      const bunny1Shape = new PhysicsShapeMesh(skull1, scene);
      bindAndShowBody(skull1, bunny1Shape, colorMeshShape);

      // Convex hull
      const bunny2Shape = new PhysicsShapeConvexHull(skull2, scene);
      bindAndShowBody(skull2, bunny2Shape, colorHullShape);

      // Aggregate
      const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.8 });
      sphere.parent = root;
      sphere.position = new Vector3(0, 0.11, 0.05);
      sphere.isVisible = false;

      const cube = MeshBuilder.CreateBox("cube", {
        width: 0.5,
        height: 0.4,
        depth: 0.3,
      });
      cube.parent = root;
      cube.position = new Vector3(0, -0.25, -0.3);
      cube.isVisible = false;

      const sphereShape = new PhysicsShapeSphere(
        new Vector3(0, 0, 0),
        0.4,
        scene
      );
      const cubeShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(0.5, 0.4, 0.3),
        scene
      );
      const skullShape = new PhysicsShapeContainer(scene);
      skullShape.addChildFromParent(root, sphereShape, sphere);
      skullShape.addChildFromParent(root, cubeShape, cube);

      bindAndShowBody(root, skullShape, colorAggregateShape);
    }

    seagullBody();
    bunnyBody();
    skullBody();

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
    viewerCheckbox.isChecked = showViewer;
    viewerCheckbox.color = "green";
    viewerCheckbox.onIsCheckedChangedObservable.add((value) => {
      if (value) {
        for (let mesh of scene.meshes) {
          if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
          }
        }
        showViewer = true;
      } else {
        for (let mesh of scene.meshes) {
          if (mesh.physicsBody) {
            viewer.hideBody(mesh.physicsBody);
          }
        }
        showViewer = false;
      }
    });

    const checkboxText = new TextBlock("checkboxText", "Debug Viewer");
    toggleViewLine.addControl(checkboxText);
    checkboxText.resizeToFit = true;
    checkboxText.color = "white";

    return scene;
  }
}
