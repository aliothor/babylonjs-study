import { ArcRotateCamera, Animation, Axis, Color3, Color4, Curve3, DirectionalLight, Engine, HemisphericLight, KeyboardEventTypes, Mesh, MeshBuilder, Nullable, PointerEventTypes, Quaternion, Scene, SpotLight, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "babylonjs-gui";

export default class HermiteQuaternionEditor {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Hermite Quaternion Editor'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 32, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const dirLight = new DirectionalLight('dirLight', new Vector3(0, -1, 0))

    let animInProgress = false
    const from3DTo4D = (v: Vector3) => {
      const r2 = v.lengthSquared();
      const r2_1 = 1 + r2;
      return new Quaternion(2 * v.x / r2_1, 2 * v.y / r2_1, 2 * v.z / r2_1, (1 - r2) / r2_1);
    }

    const quats: Quaternion[] = [];

    const hermiteQuarternionSpline = (p1: Quaternion, t1: Quaternion, p2: Quaternion, t2: Quaternion, nbPoints: number) => {
      const hermite = new Array<Vector3>();
      const step = 1.0 / nbPoints;
      for (let i = 0; i <= nbPoints; i++) {
        const q = Quaternion.Hermite(p1, t1, p2, t2, i * step)
        q.normalize();
        if (q.w < 0) {
          q.scaleInPlace(-1);
        }
        quats[i] = q;
        const v = new Vector3(q.x / (1 + q.w), q.y / (1 + q.w), q.z / (1 + q.w));
        hermite.push(v);
      }
      return new Curve3(hermite);
    }

    const radius = 10;
    const tRadius = 4;

    const p1Vec = Axis.Y.scale(radius);
    const p2Vec = Axis.Y.scale(-radius);
    const t1Vec = Axis.X.scale(0.25 * radius);
    const t2Vec = Axis.X.scale(-0.25 * radius);

    interface MySphere extends Mesh {
      [prot: string]: any
    }
    const p1Sphere: MySphere = MeshBuilder.CreateSphere("p1Sphere", { diameter: 1 });
    p1Sphere.material = new StandardMaterial("");
    p1Sphere.pickedColor = new Color4(0, 1, 0, 1);
    p1Sphere.unpickedColor = new Color4(0.02, 0.58, 0.03);
    p1Sphere.material.diffuseColor = p1Sphere.unpickedColor;
    p1Sphere.position = p1Vec;
    p1Sphere.center = Vector3.Zero();
    p1Sphere.maxRadius = radius;
    p1Sphere.radius = radius;
    p1Sphere.theta = 0;
    p1Sphere.phi = 0;
    p1Sphere.scale = 1;
    p1Sphere.radial = MeshBuilder.CreateDashedLines("p1Radial", { dashNb: 18, dashSize: 3, gapSize: 3, updatable: true, points: [p1Sphere.center, p1Sphere.getAbsolutePosition()] });

    const p2Sphere: MySphere = MeshBuilder.CreateSphere("p2Sphere", { diameter: 1 });
    p2Sphere.material = new StandardMaterial("");
    p2Sphere.pickedColor = new Color4(1, 0, 0, 1);
    p2Sphere.unpickedColor = new Color4(0.48, 0, 0, 1);
    p2Sphere.material.diffuseColor = p2Sphere.unpickedColor;
    p2Sphere.position = p2Vec;
    p2Sphere.center = Vector3.Zero();
    p2Sphere.maxRadius = radius;
    p2Sphere.radius = radius;
    p2Sphere.theta = Math.PI;
    p2Sphere.phi = 0;
    p2Sphere.scale = 1;
    p2Sphere.radial = MeshBuilder.CreateDashedLines("p2Radial", { dashNb: 18, dashSize: 3, gapSize: 3, updatable: true, points: [p2Sphere.center, p2Sphere.getAbsolutePosition()] });

    const t1Sphere: MySphere = MeshBuilder.CreateSphere("t1Sphere", { diameter: 0.75 });
    t1Sphere.parent = p1Sphere;
    t1Sphere.material = new StandardMaterial("");
    t1Sphere.pickedColor = new Color4(0.76, 0, 1, 1);
    t1Sphere.unpickedColor = new Color4(0.18, 0, 0.1, 1);
    t1Sphere.material.diffuseColor = t1Sphere.unpickedColor;
    t1Sphere.position = t1Vec;
    t1Sphere.center = Vector3.Zero();
    t1Sphere.maxRadius = tRadius;
    t1Sphere.radius = tRadius;
    t1Sphere.theta = Math.PI / 2;
    t1Sphere.phi = 0;
    t1Sphere.scale = 1;
    t1Sphere.radial = MeshBuilder.CreateDashedLines("t1Radial", { dashNb: 18, dashSize: 3, gapSize: 3, updatable: true, points: [t1Sphere.center, t1Sphere.position] });
    t1Sphere.radial.parent = p1Sphere;

    const t2Sphere: MySphere = MeshBuilder.CreateSphere("t2Sphere", { diameter: 0.75 });
    t2Sphere.parent = p2Sphere;
    t2Sphere.material = new StandardMaterial("");
    t2Sphere.pickedColor = new Color4(0.76, 0, 1, 1);
    t2Sphere.unpickedColor = new Color4(0.18, 0, 0.1, 1);
    t2Sphere.material.diffuseColor = t2Sphere.unpickedColor;
    t2Sphere.position = t2Vec;
    t2Sphere.center = Vector3.Zero(); //p2Sphere.position;
    t2Sphere.maxRadius = tRadius;
    t2Sphere.radius = tRadius;
    t2Sphere.theta = Math.PI / 2;
    t2Sphere.phi = Math.PI;
    t2Sphere.scale = 1;
    t2Sphere.radial = MeshBuilder.CreateDashedLines("t2Radial", { dashNb: 18, dashSize: 3, gapSize: 3, updatable: true, points: [t2Sphere.center, t2Sphere.position] });
    t2Sphere.radial.parent = p2Sphere;

    const outerSphere = MeshBuilder.CreateSphere("outerSphere", { diameter: 2 * radius });
    outerSphere.visibility = 0.15;
    outerSphere.material = new StandardMaterial("yellow");
    outerSphere.material.diffuseColor = new Color4(0, 1, 0.88, 0.34);
    outerSphere.material.wireframe = true;
    outerSphere.isPickable = false;

    const innerSphere = MeshBuilder.CreateSphere("innerSphere", { diameter: 2 * radius });
    innerSphere.visibility = 0.15;
    innerSphere.material = new StandardMaterial("white");
    innerSphere.material.diffuseColor = Color3.White();

    innerSphere.isPickable = false;

    const axisX = MeshBuilder.CreateLines("xAxis", { points: [Axis.X.scale(-radius), Axis.X.scale(radius)] });
    axisX.color = Color3.Red();
    axisX.isPickable = false;
    const axisY = MeshBuilder.CreateLines("yAxis", { points: [Axis.Y.scale(-radius), Axis.Y.scale(radius)] });
    axisY.color = Color3.Green();
    axisY.isPickable = false;
    const axisZ = MeshBuilder.CreateLines("zAxis", { points: [Axis.Z.scale(-radius), Axis.Z.scale(radius)] });
    axisZ.color = Color3.Blue();
    axisZ.isPickable = false;

    const backPlane = MeshBuilder.CreatePlane("backPlane", { width: 1000, height: 1000 });
    backPlane.position.z = 40;
    backPlane.visibility = 0.01;

    let startingPoint: Nullable<Vector3> = null;
    let currentMesh = p1Sphere;

    const getPlanePosition = function () {
      var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == backPlane; });
      if (pickinfo.hit) {
        return pickinfo.pickedPoint;
      }

      return null;
    }

    const pointerDown = function (mesh: Mesh) {
      currentMesh = mesh;
      startingPoint = getPlanePosition();
      if (startingPoint) { // we need to disconnect camera from canvas
        setTimeout(function () {
          camera.detachControl();
        }, 0);
      }
    }

    const pointerUp = () => {
      currentMesh.material.diffuseColor = currentMesh.unpickedColor;
      if (startingPoint) {
        camera.attachControl(this.canvas, true);
        startingPoint = null;
        return;
      }
    }

    const updateCurve = function () {
      const pq1 = from3DTo4D(p1Sphere.position.scale(1 / p1Sphere.maxRadius));
      const pq2 = from3DTo4D(p2Sphere.position.scale(1 / p2Sphere.maxRadius));
      const tq1 = from3DTo4D(t1Sphere.position.scale(1 / t1Sphere.maxRadius));
      const tq2 = from3DTo4D(t2Sphere.position.scale(1 / t2Sphere.maxRadius));

      const hermiteCurve = hermiteQuarternionSpline(pq1, tq1, pq2, tq2, 100)

      const hermitePoints = hermiteCurve.getPoints().map((el) => {
        return el.scale(radius);
      });
      return hermitePoints
    }

    const updateCurrent = function (mesh) {
      const x = mesh.radius * Math.sin(mesh.theta) * Math.cos(mesh.phi);
      const y = mesh.radius * Math.cos(mesh.theta);
      const z = mesh.radius * Math.sin(mesh.theta) * Math.sin(mesh.phi);
      mesh.position.set(x, y, z);
      mesh.radial = MeshBuilder.CreateDashedLines(mesh.name, { points: [mesh.center, mesh.position], instance: mesh.radial });
      if (mesh.getChildMeshes()[0]) {
        const child = mesh.getChildMeshes()[0];
        child.radial = MeshBuilder.CreateDashedLines(child.name, { points: [child.center, child.position], instance: child.radial });
      }
    }

    updateCurrent(p1Sphere);
    updateCurrent(p2Sphere);
    updateCurrent(t1Sphere);
    updateCurrent(t2Sphere);

    const hermPtsStart = updateCurve();

    let hermiteLine = MeshBuilder.CreateLines("hermiteLine", { updatable: true, points: hermPtsStart })

    const pointerMove = function () {
      if (!startingPoint) {
        return;
      }
      const current = getPlanePosition();
      if (!current) {
        return;
      }

      const diff = current.subtract(startingPoint);
      currentMesh.theta -= 0.1 * diff.y;
      if (currentMesh.theta <= 0) {
        currentMesh.theta = 0;
      }
      if (currentMesh.theta >= Math.PI) {
        currentMesh.theta = Math.PI;
      }
      currentMesh.phi -= 0.1 * diff.x;
      currentMesh.phi %= 2 * Math.PI;

      updateCurrent(currentMesh);
      const hermPts = updateCurve();

      hermiteLine = MeshBuilder.CreateLines("hermiteLine", { points: hermPts, instance: hermiteLine })

      startingPoint = current;

    }

    scene.onPointerObservable.add((pointerInfo) => {
      if (animInProgress) {
        return
      }
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          const pickedMesh = pointerInfo.pickInfo.pickedMesh;
          const meshPick = pointerInfo.pickInfo.hit &&
            pickedMesh !== backPlane &&
            (
              pickedMesh === p1Sphere ||
              pickedMesh === p2Sphere ||
              pickedMesh === t1Sphere ||
              pickedMesh === t2Sphere
            )
          if (meshPick) {
            pickedMesh.material.diffuseColor = pickedMesh.pickedColor;
            pointerDown(pickedMesh)
          }
          break;
        case PointerEventTypes.POINTERUP:
          pointerUp();
          break;
        case PointerEventTypes.POINTERMOVE:
          pointerMove();
          break;
      }
    });

    scene.onKeyboardObservable.add((kbInfo) => {
      if (animInProgress) {
        return
      }
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          setTimeout(function () {
            camera.detachControl();
          }, 0);
          switch (kbInfo.event.key) {
            case "w":
            case "W":
            case "ArrowUp":
              currentMesh.scale = 1 / 0.99;
              break
            case "x":
            case "X":
            case "ArrowDown":
              currentMesh.scale = 0.99;
              break
            case " ":
              console.log("space");
              setTimeout(() => {
                camera.attachControl(this.canvas, true);
              }, 1);
              break
          }
          break;
      }

      currentMesh.radius *= currentMesh.scale;

      if (currentMesh.radius > currentMesh.maxRadius) {
        currentMesh.radius = currentMesh.maxRadius;
        currentMesh.scale = 1;
      }
      if (currentMesh.radius < currentMesh.maxRadius * 0.05) {
        currentMesh.radius = currentMesh.maxRadius * 0.05;
        currentMesh.scale = 0.05;
      }

      if (currentMesh.getChildMeshes()[0]) {
        innerSphere.scaling = new Vector3(0.99 * currentMesh.radius / currentMesh.maxRadius, 0.99 * currentMesh.radius / currentMesh.maxRadius, 0.99 * currentMesh.radius / currentMesh.maxRadius);
      }

      updateCurrent(currentMesh);
      const hermPts = updateCurve();

      hermiteLine = MeshBuilder.CreateLines("hermiteLine", { points: hermPts, instance: hermiteLine });
    });

    const faceColors = [];
    faceColors[0] = Color4.FromColor3(Color3.Blue());
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green());
    faceColors[3] = Color4.FromColor3(Color3.White());
    faceColors[4] = Color4.FromColor3(Color3.Yellow());
    faceColors[5] = Color4.FromColor3(Color3.Black());


    const box = MeshBuilder.CreateBox("box", { size: 3, faceColors: faceColors });
    box.position.x = 12;
    box.position.y = -8;

    const spot = new SpotLight("spotLight", new Vector3(12, -8, -5), new Vector3(0, 0, 1), Math.PI / 2.5, 2, scene);
    spot.specular = new Color3(0, 0, 0);

    //animation
    const animFrameRate = 20; //per sec

    const animationRotation = new Animation("animationRotation", "rotationQuaternion", animFrameRate, Animation.ANIMATIONTYPE_QUATERNION,
      Animation.ANIMATIONLOOPMODE_CONSTANT);

    const endOfAnimation = () => {
      panel.children[0].textBlock.text = "Animate";
      panel.children[0].isVisible = true;
      animInProgress = false;
    }

    const rotationKeys = [];

    const updateAnim = () => {
      console.log("IN");
      for (let q = 0; q < quats.length; q++) {
        rotationKeys[q] = { frame: q, value: quats[q] }
      }

      //Adding keys to the animation object
      animationRotation.setKeys(rotationKeys);

      scene.beginDirectAnimation(box, [animationRotation], 0, quats.length - 1, false, 1, endOfAnimation);
    }

    // UI
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel();
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.left = "210px";
    panel.top = "-10px";
    advancedTexture.addControl(panel);

    const addButton = function (text: string, callback) {
      const button = Button.CreateSimpleButton("button", text);
      button.width = "120px";
      button.height = "40px";
      button.color = "white";
      button.background = "green";
      button.paddingLeft = "10px";
      button.paddingRight = "10px";
      button.onPointerUpObservable.add(function () {
        callback();
      });
      panel.addControl(button);
    }

    addButton("Animate", function () {
      box.rotationQuaternion = quats[0];
      panel.children[0].textBlock.text = "Initiate";

      setTimeout(function () {
        panel.children[0].textBlock.text = "3";
      }, 1000);
      setTimeout(function () {
        panel.children[0].textBlock.text = "2";
      }, 2000);
      setTimeout(function () {
        panel.children[0].textBlock.text = "1";
      }, 3000);
      setTimeout(function () {
        updateAnim();
        panel.children[0].isVisible = false;
      }, 4000);

    });
    return scene;
  }
}