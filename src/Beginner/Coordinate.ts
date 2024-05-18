import { DynamicTexture, StandardMaterial, Color3, MeshBuilder, Vector3, TransformNode, Scene } from "babylonjs";

export default class Coordinate {
  constructor(private scene: Scene) {}
  
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