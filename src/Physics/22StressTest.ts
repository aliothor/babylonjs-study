import {
  ArcRotateCamera,
  Color3,
  Engine,
  HavokPlugin,
  HemisphericLight,
  KeyboardEventTypes,
  Matrix,
  Mesh,
  MeshBuilder,
  PhysicsBody,
  PhysicsMaterial,
  PhysicsMotionType,
  PhysicsShape,
  PhysicsShapeBox,
  PhysicsShapeConvexHull,
  PhysicsShapeMesh,
  PhysicsShapeSphere,
  Quaternion,
  Scene,
  SceneInstrumentation,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import HavokPhysics from "@babylonjs/havok";
import {
  AdvancedDynamicTexture,
  Button,
  Checkbox,
  Control,
  RadioButton,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";
(globalThis as any).HK = await HavokPhysics();

export default class StressTest {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML = "Stress Test";
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

    camera.position = new Vector3(0, 50, -200);
    const hk = new HavokPlugin();
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    const meshesToDispose: Mesh[] = [];
    const shapesToDispose: PhysicsShape[] = [];
    const bodiesToDispose: PhysicsBody[] = [];
    const matsToDispose: StandardMaterial[] = [];

    let worldType = "box";
    let objectType = "box";
    const size = 2;
    const padding = 1;
    const numSide = 10;
    let numConvex = 2;
    let baseBox: Mesh, baseSphere: Mesh, baseConvex: Mesh;
    let useConvexShapes = true;
    let useMeshShapes = false;
    let boxesPhysicsShape: PhysicsShape,
      spherePhysicsShape: PhysicsShape,
      convexPhysicsShape: PhysicsShape;
    let disablePreStep = true;

    const objPhyMat: PhysicsMaterial = { friction: 0.2, restitution: 0.3 };
    // world

    function createBaseMeshesAndMats() {
      const objMat = new StandardMaterial("objMat");
      matsToDispose.push(objMat);
      baseBox = MeshBuilder.CreateBox("baseBox", { size });
      baseSphere = MeshBuilder.CreateSphere("baseSphere", { diameter: size });
      if (useConvexShapes || useMeshShapes) {
        baseConvex = MeshBuilder.CreateTorusKnot("baseConvex", {
          radius: size,
          tube: size / 4,
        });
      }

      const baseMeshes = [baseBox, baseSphere];
      if (useConvexShapes || useMeshShapes) {
        baseMeshes.push(baseConvex);
      }
      objMat.disableLighting = false;
      for (const base of baseMeshes) {
        base.material = objMat;
        base.isVisible = false;
      }
    }

    function initializePhysics() {
      boxesPhysicsShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(size, size, size),
        scene
      );
      boxesPhysicsShape.material = objPhyMat;

      spherePhysicsShape = new PhysicsShapeSphere(
        new Vector3(0, 0, 0),
        size / 2,
        scene
      );
      spherePhysicsShape.material = objPhyMat;

      if (useConvexShapes) {
        convexPhysicsShape = new PhysicsShapeConvexHull(baseConvex, scene);
        convexPhysicsShape.material = objPhyMat;
      }
      if (useMeshShapes) {
        convexPhysicsShape = new PhysicsShapeMesh(baseConvex, scene);
        convexPhysicsShape.material = objPhyMat;
      }
    }

    function createGround(phyMat: PhysicsMaterial) {
      const ground = MeshBuilder.CreateGround("ground", {
        width: 200,
        height: 200,
      });
      const mat = new StandardMaterial("gMat");
      mat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      ground.material = mat;
      matsToDispose.push(mat);
      meshesToDispose.push(ground);
      const shape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(200, 0.001, 200),
        scene
      );
      shape.material = phyMat;
      shapesToDispose.push(shape);
      const body = new PhysicsBody(
        ground,
        PhysicsMotionType.STATIC,
        false,
        scene
      );
      body.shape = shape;
      body.setMassProperties({ mass: 0 });
      bodiesToDispose.push(body);
    }

    function createHeightmap(phyMat: PhysicsMaterial) {
      const ground = MeshBuilder.CreateGroundFromHeightMap(
        "ground",
        "https://playground.babylonjs.com/textures/heightMap.png",
        {
          width: 200,
          height: 200,
          subdivisions: 100,
          maxHeight: 35,
          onReady: (mesh) => {
            meshesToDispose.push(mesh);
            const mat = new StandardMaterial("heightmapMat");
            matsToDispose.push(mat);
            mat.emissiveColor = Color3.Green();
            mat.wireframe = true;
            mesh.material = mat;
            matsToDispose.push(mat);

            const groundShape = new PhysicsShapeMesh(ground, scene);
            groundShape.material = phyMat;
            shapesToDispose.push(groundShape);
            const body = new PhysicsBody(
              ground,
              PhysicsMotionType.STATIC,
              false,
              scene
            );
            body.shape = groundShape;
            body.setMassProperties({ mass: 0 });
            bodiesToDispose.push(body);
          },
        }
      );
    }

    function createShapes(
      size: number,
      padding: number,
      numPerSide: number,
      startingPosition: Vector3,
      baseShape: PhysicsShape,
      baseMesh: Mesh
    ) {
      let index = 0;
      const instanceCount = numPerSide * numPerSide * numPerSide;
      const matricesData = new Float32Array(instanceCount * 16);
      const colorsData = new Float32Array(instanceCount * 4);
      const position = Vector3.Zero();
      const matrix = Matrix.Identity();

      for (let x = 0; x < numPerSide; x++) {
        for (let y = 0; y < numPerSide; y++) {
          for (let z = 0; z < numPerSide; z++) {
            position.x = (x - numPerSide / 2) * (size + padding);
            position.y = y * (size + padding) + size / 2;
            position.z = (z - numPerSide / 2) * (size + padding);
            position.addInPlace(startingPosition);

            matrix.setTranslation(position);
            matrix.copyToArray(matricesData, index * 16);

            colorsData[index * 4 + 0] = Math.random();
            colorsData[index * 4 + 1] = Math.random();
            colorsData[index * 4 + 2] = Math.random();
            colorsData[index * 4 + 3] = 1;

            index++;
          }
        }
      }

      baseMesh.isVisible = true;
      baseMesh.alwaysSelectAsActiveMesh = true;
      baseMesh.thinInstanceSetBuffer("matrix", matricesData, 16, false);
      baseMesh.thinInstanceSetBuffer("color", colorsData, 4);

      const body = new PhysicsBody(
        baseMesh,
        PhysicsMotionType.DYNAMIC,
        false,
        scene
      );
      body.disablePreStep = disablePreStep;
      body.shape = baseShape;
      body.setMassProperties({ mass: size });
      bodiesToDispose.push(body);

      meshesToDispose.push(baseMesh);
    }

    function createWorld() {
      switch (worldType) {
        case "box":
          createGround(objPhyMat);
          break;
        case "heightmap":
          createHeightmap(objPhyMat);
          break;
      }

      const startingPosition = new Vector3(0, 100, 0);

      createShapes(
        size,
        padding,
        numSide,
        startingPosition,
        boxesPhysicsShape,
        baseBox
      );

      createShapes(
        size,
        padding,
        numSide,
        new Vector3(0, numSide * (size + padding) + size / 2, 0),
        spherePhysicsShape,
        baseSphere
      );

      if (useConvexShapes || useMeshShapes) {
        createShapes(
          size,
          padding,
          numConvex,
          startingPosition.add(
            new Vector3(0, 2 * numSide * (size + padding) + size / 2, 0)
          ),
          convexPhysicsShape,
          baseConvex
        );
      }
    }
    createBaseMeshesAndMats();
    initializePhysics();
    createWorld();

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    scene.onKeyboardObservable.add((kbInfo) => {
      if (
        kbInfo.type == KeyboardEventTypes.KEYDOWN &&
        kbInfo.event.key == "h"
      ) {
        adt.rootContainer.isVisible = !adt.rootContainer.isVisible;
      }
    });

    const panel = new StackPanel();
    adt.addControl(panel);
    panel.width = "200px";
    panel.adaptHeightToChildren = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

    function addText(parent: StackPanel, updateFn: (t: TextBlock) => void) {
      const txt = new TextBlock("txt");
      parent.addControl(txt);
      txt.resizeToFit = true;
      txt.color = "white";
      txt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      scene.onAfterRenderObservable.add(() => updateFn(txt));
      return txt;
    }

    addText(panel, (txt) => {
      txt.text = `bodies: ${hk.numBodies}`;
    });

    addText(panel, (txt) => {
      txt.text = `num objects: ${
        numSide * numSide * numSide * 2 + numConvex * numConvex * numConvex
      }`;
    });

    const sceneInstrumentation = new SceneInstrumentation(scene);
    sceneInstrumentation.captureFrameTime = true;
    sceneInstrumentation.capturePhysicsTime = true;

    addText(panel, (txt) => {
      txt.text = `absolute fps: ${(
        1000 / sceneInstrumentation.frameTimeCounter.lastSecAverage
      ).toFixed(2)}`;
    });

    addText(panel, (txt) => {
      txt.text = `physics time: ${sceneInstrumentation.physicsTimeCounter.lastSecAverage.toFixed(
        2
      )}`;
    });

    function addOptions(
      parent: StackPanel,
      text: string,
      initOption,
      options,
      fn: (opt) => void
    ) {
      const cont = new StackPanel("cont");
      cont.width = "100%";
      cont.heightInPixels = 40 * (options.length + 1) + 10;
      parent.addControl(cont);
      const headerText = new TextBlock("tb", text);
      headerText.width = "100%";
      headerText.height = "40px";
      headerText.fontSize = "20px";
      headerText.color = "white";
      cont.addControl(headerText);
      for (const option of options) {
        const btn = new RadioButton("rb");
        btn.width = "20px";
        btn.height = "20px";
        btn.color = "white";
        btn.group = text;
        btn.isChecked = option === initOption;
        btn.onIsCheckedChangedObservable.add((state) => {
          if (state) {
            fn(option);
          }
        });
        const selector = Control.AddHeader(btn, option, "100px", {
          isHorizontal: true,
          controlFirst: true,
        });
        selector.width = "100%";
        selector.paddingLeft = "10px";
        selector.height = "40px";
        selector.color = "white";
        cont.addControl(selector);
      }
    }

    addOptions(
      panel,
      "Initial World",
      worldType,
      ["box", "heightmap"],
      (value) => {
        worldType = value;
      }
    );

    function addCheckbox(
      parent: StackPanel,
      text: string,
      fn: (value: boolean) => void
    ) {
      const checkbox = new Checkbox();
      checkbox.width = "20px";
      checkbox.height = "20px";
      checkbox.isChecked = false;
      checkbox.color = "white";
      checkbox.onIsCheckedChangedObservable.add(fn);

      const selector = Control.AddHeader(checkbox, text, "200px", {
        isHorizontal: true,
        controlFirst: true,
      });
      selector.width = "100%";
      selector.paddingLeft = "10px";
      selector.height = "20px";
      selector.color = "white";
      parent.addControl(selector);
    }
    addCheckbox(panel, "Body pre-step update", (value) => {
      bodiesToDispose.forEach((body) => (body.disablePreStep = !value));
    });

    function addButton(parent: StackPanel, text: string, fn: () => void) {
      const btn = Button.CreateSimpleButton("btn", text);
      parent.addControl(btn);
      btn.width = "100%";
      btn.height = "40px";
      btn.background = "green";
      btn.color = "white";
      btn.onPointerClickObservable.add(fn);
    }

    function restartScene() {
      for (const body of bodiesToDispose) {
        body.dispose();
      }
      bodiesToDispose.length = 0;

      for (const shape of shapesToDispose) {
        shape.dispose();
      }
      shapesToDispose.length = 0;

      for (const mesh of meshesToDispose) {
        mesh.dispose();
      }
      meshesToDispose.length = 0;

      for (const mat of matsToDispose) {
        mat.dispose();
      }
      matsToDispose.length = 0;
    }

    addButton(panel, "Restart SCene", () => {
      restartScene();
      createBaseMeshesAndMats();
      createWorld();
    });

    return scene;
  }
}
