import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  SpotLight,
  StandardMaterial,
  Vector3
} from "babylonjs";

export default class StreetLight {
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
      -Math.PI / 2,
      Math.PI / 2.5,
      50,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 0.5;

    const lampLight = new SpotLight(
      "lampLight",
      Vector3.Zero(),
      new Vector3(0, -1, 0),
      Math.PI,
      1,
      scene
    );
    lampLight.diffuse = Color3.Yellow();

    //shape to extrude
    const lampShape = [];
    for (let i = 0; i < 20; i++) {
      lampShape.push(
        new Vector3(
          Math.cos((i * Math.PI) / 10),
          Math.sin((i * Math.PI) / 10),
          0
        )
      );
    }
    lampShape.push(lampShape[0]); //close shape

    //extrusion path
    const lampPath = [];
    lampPath.push(new Vector3(0, 0, 0));
    lampPath.push(new Vector3(0, 10, 0));
    for (let i = 0; i < 20; i++) {
      lampPath.push(
        new Vector3(
          1 + Math.cos(Math.PI - (i * Math.PI) / 40),
          10 + Math.sin(Math.PI - (i * Math.PI) / 40),
          0
        )
      );
    }
    lampPath.push(new Vector3(3, 11, 0));

    const yellowMat = new StandardMaterial("yellowMat");
    yellowMat.emissiveColor = Color3.Yellow();

    //extrude lamp
    const lamp = MeshBuilder.ExtrudeShape("lamp", {
      cap: Mesh.CAP_END,
      shape: lampShape,
      path: lampPath,
      scale: 0.5
    });

    //add bulb
    const bulb = MeshBuilder.CreateSphere("bulb", {
      diameterX: 1.5,
      diameterZ: 0.8
    });

    bulb.material = yellowMat;
    bulb.parent = lamp;
    bulb.position.x = 2;
    bulb.position.y = 10.5;

    lampLight.parent = bulb;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 50,
      height: 50
    });

    return scene;
  }
}
