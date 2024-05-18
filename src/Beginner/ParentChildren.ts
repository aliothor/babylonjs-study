import {
  ArcRotateCamera,
  Color3,
  DynamicTexture,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  TransformNode,
  Vector3
} from "babylonjs";

export default class ParentChildren {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2.2,
      Math.PI / 2.5,
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );

    const faceColors = [];
    faceColors[0] = Color3.Blue().toColor4();
    faceColors[1] = Color3.Teal().toColor4();
    faceColors[2] = Color3.Red().toColor4();
    faceColors[3] = Color3.Purple().toColor4();
    faceColors[4] = Color3.Green().toColor4();
    faceColors[5] = Color3.Yellow().toColor4();

    const boxParent = MeshBuilder.CreateBox("boxp", { faceColors: faceColors });
    const boxChild = MeshBuilder.CreateBox("boxc", {
      size: 0.5,
      faceColors: faceColors
    });
    boxChild.parent = boxParent;

    boxChild.position.x = 0;
    boxChild.position.y = 2;
    boxChild.position.z = 0;

    boxChild.rotation.x = Math.PI / 4;
    boxChild.rotation.y = Math.PI / 4;
    boxChild.rotation.z = Math.PI / 4;

    boxParent.position.x = 2;
    boxParent.position.y = 0;
    boxParent.position.z = 0;

    boxParent.rotation.x = 0;
    boxParent.rotation.y = 0;
    boxParent.rotation.z = -Math.PI / 4;

    this.showAxis(6);
    const boxChildAxes = this.localAxes(1);
    boxChildAxes.parent = boxChild;

    return scene;
  }

  showAxis(size: number) {
    const makeTextPlane = (text: string, color: string, size: number) => {
      const dynamicTexture = new DynamicTexture(
        "dynamicTexture",
        50,
        this.scene,
        true
      );
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(
        text,
        5,
        40,
        "bold 36px Arial",
        color,
        "transparent",
        true
      );

      const planeMat = new StandardMaterial("textPlaneMat");
      planeMat.backFaceCulling = false;
      planeMat.specularColor = new Color3(0, 0, 0);
      planeMat.diffuseTexture = dynamicTexture;
      const plane = MeshBuilder.CreatePlane("textPlane", { size: size });
      plane.material = planeMat;

      return plane;
    };

    const axisX = MeshBuilder.CreateLines("axisX", {
      points: [
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, size * 0.05, 0),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, -0.05 * size, 0)
      ]
    });
    axisX.color = new Color3(1, 0, 0);
    const xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisY = MeshBuilder.CreateLines("axisY", {
      points: [
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0),
        new Vector3(0.05 * size, size * 0.95, 0)
      ]
    });
    axisY.color = new Color3(0, 1, 0);
    const yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

    const axisZ = MeshBuilder.CreateLines("axisZ", {
      points: [
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size),
        new Vector3(0, 0.05 * size, size * 0.95)
      ]
    });
    axisZ.color = new Color3(0, 0, 1);
    const zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  }

  localAxes(size: number) {
    const local_axisX = MeshBuilder.CreateLines("local_axisX", {
      points: [
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, -0.05 * size, 0)
      ]
    });
    local_axisX.color = new Color3(1, 0, 0);

    const local_axisY = MeshBuilder.CreateLines("local_axisY", {
      points: [
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0),
        new Vector3(0.05 * size, size * 0.95, 0)
      ]
    });
    local_axisY.color = new Color3(0, 1, 0);

    const local_axisZ = MeshBuilder.CreateLines("local_axisZ", {
      points: [
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size),
        new Vector3(0, 0.05 * size, size * 0.95)
      ]
    });
    local_axisZ.color = new Color3(0, 0, 1);

    const local_origin = new TransformNode("local_origin");

    local_axisX.parent = local_origin;
    local_axisY.parent = local_origin;
    local_axisZ.parent = local_origin;

    return local_origin;
  };
}
