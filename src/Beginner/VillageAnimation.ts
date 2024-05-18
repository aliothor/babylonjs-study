import {
  Animation,
  ArcRotateCamera,
  Axis,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SceneLoader,
  Space,
  StandardMaterial,
  Texture,
  Tools,
  Vector3,
  Vector4
} from "babylonjs";
// import * as earcut from "earcut";
// (window as any).earcut = earcut;
import "babylonjs-loaders";

export default class VillageAnimation {
  engine: Engine;
  scene: Scene;

  carReady: boolean;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.carReady = false;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 1.5,
      Math.PI / 2.2,
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this.scene
    );

    // 碰撞盒子
    const wireMat = new StandardMaterial("wireMat");
    wireMat.wireframe = true;
    // wireMat.alpha = 0;

    const hitBox = MeshBuilder.CreateBox("carbox", {
      width: 0.5,
      height: 0.6,
      depth: 4.5
    });
    hitBox.material = wireMat;
    hitBox.position.x = 3.1;
    hitBox.position.y = 0.3;
    hitBox.position.z = -5;

    // 人物动画
    this.importCharacter(scene);

    // 导入模型方法
    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "village.glb"
    );
    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "car.glb"
    ).then(() => {
      const car = scene.getMeshByName("car")!;
      this.carReady = true;
      car.rotation = new Vector3(Math.PI / 2, 0, -Math.PI / 2);
      car.position.y = 0.16;
      car.position.x = -3;
      car.position.z = 8;

      const animCar = new Animation(
        "carAnimation",
        "position.z",
        30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const carKeys = [];

      carKeys.push({
        frame: 0,
        value: 8
      });

      carKeys.push({
        frame: 150,
        value: -7
      });

      carKeys.push({
        frame: 200,
        value: -7
      });

      animCar.setKeys(carKeys);

      car.animations = [];
      car.animations.push(animCar);

      scene.beginAnimation(car, 0, 200, true);

      //wheel animation
      const wheelRB = scene.getMeshByName("wheelRB");
      const wheelRF = scene.getMeshByName("wheelRF");
      const wheelLB = scene.getMeshByName("wheelLB");
      const wheelLF = scene.getMeshByName("wheelLF");

      scene.beginAnimation(wheelRB, 0, 30, true);
      scene.beginAnimation(wheelRF, 0, 30, true);
      scene.beginAnimation(wheelLB, 0, 30, true);
      scene.beginAnimation(wheelLF, 0, 30, true);
    });

    // const car = this.buildCar(scene);
    // car.rotation.x = -Math.PI / 2;

    return scene;
  }
  importCharacter(scene: Scene) {
    SceneLoader.ImportMeshAsync(
      "him",
      "https://playground.babylonjs.com/scenes/Dude/",
      "Dude.babylon"
    ).then((result) => {
      var dude = result.meshes[0];
      dude.scaling = new Vector3(0.008, 0.008, 0.008);

      dude.position = new Vector3(1.5, 0, -6.9);
      dude.rotate(Axis.Y, Tools.ToRadians(-90), Space.LOCAL);
      // dude.position = new Vector3(-6, 0, 0);
      // dude.rotate(Axis.Y, Tools.ToRadians(-95), Space.LOCAL);
      const startRotation = dude.rotationQuaternion!.clone();

      scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

      class walk {
        turn: number;
        dist: number;
        constructor(turn: number, dist: number) {
          //after covering dist apply turn
          this.turn = turn;
          this.dist = dist;
        }
      }
      const track: any[] = [];
      // track.push(new walk(86, 7));
      // track.push(new walk(-85, 14.8));
      // track.push(new walk(-93, 16.5));
      // track.push(new walk(48, 25.5));
      // track.push(new walk(-112, 30.5));
      // track.push(new walk(-72, 33.2));
      // track.push(new walk(42, 37.5));
      // track.push(new walk(-98, 45.2));
      // track.push(new walk(0, 47));
      track.push(new walk(180, 2.5));
      track.push(new walk(0, 5));

      let distance = 0;
      let step = 0.015;
      let p = 0;

      const hitBox = scene.getMeshByName("carbox")!;
      scene.onBeforeRenderObservable.add(() => {
        if (this.carReady) {
          if (
            scene.getMeshByName("car")!.intersectsMesh(hitBox) &&
            !dude.getChildMeshes()[1].intersectsMesh(hitBox)
          ) {
            return;
          }
        }
        dude.movePOV(0, 0, step);
        distance += step;

        if (distance > track[p].dist) {
          dude.rotate(Axis.Y, Tools.ToRadians(track[p].turn), Space.LOCAL);
          p += 1;
          p %= track.length;
          if (p === 0) {
            distance = 0;
            dude.position = new Vector3(1.5, 0, -6.9);
            // dude.position = new Vector3(-6, 0, 0);
            dude.rotationQuaternion = startRotation.clone();
          }
        }
      });
    });
  }
  buildCar(scene: Scene) {
    //base
    const outline = [new Vector3(-0.3, 0, -0.1), new Vector3(0.2, 0, -0.1)];

    //curved front
    for (let i = 0; i < 20; i++) {
      outline.push(
        new Vector3(
          0.2 * Math.cos((i * Math.PI) / 40),
          0,
          0.2 * Math.sin((i * Math.PI) / 40) - 0.1
        )
      );
    }

    //top
    outline.push(new Vector3(0, 0, 0.1));
    outline.push(new Vector3(-0.3, 0, 0.1));

    // https://assets.babylonjs.com/environments/car.png
    // https://assets.babylonjs.com/environments/wheel.png
    const carMat = new StandardMaterial("carMat");
    carMat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/car.png"
    );

    const faceUV = [];
    faceUV[0] = new Vector4(0, 0.5, 0.38, 1);
    faceUV[1] = new Vector4(0, 0, 1, 0.5);
    faceUV[2] = new Vector4(0.38, 1, 0, 0.5);

    const car = MeshBuilder.ExtrudePolygon("car", {
      shape: outline,
      depth: 0.2,
      faceUV: faceUV,
      wrap: true
    });
    car.material = carMat;

    const wheelRBMat = new StandardMaterial("wheelRBMat");
    wheelRBMat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/wheel.png"
    );

    const wheelUV = [];
    wheelUV[0] = new Vector4(0, 0, 1, 1);
    wheelUV[1] = new Vector4(0, 0.5, 0, 0.5);
    wheelUV[2] = new Vector4(0, 0, 1, 1);

    const wheelRB = MeshBuilder.CreateCylinder("wheelRB", {
      diameter: 0.125,
      height: 0.05,
      faceUV: wheelUV
    });
    wheelRB.material = wheelRBMat;
    wheelRB.parent = car;
    wheelRB.position.z = -0.1;
    wheelRB.position.x = -0.2;
    wheelRB.position.y = 0.035;

    const wheelRF = wheelRB.clone("wheelRF");
    wheelRF.position.x = 0.1;

    const wheelLB = wheelRB.clone("wheelLB");
    wheelLB.position.y = -0.2 - 0.035;

    const wheelLF = wheelRF.clone("wheelLF");
    wheelLF.position.y = -0.2 - 0.035;

    // 动画
    const animWheel = new Animation(
      "wheelAnimation",
      "rotation.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const wheelKeys = [];
    wheelKeys.push({
      frame: 0,
      value: 0
    });
    wheelKeys.push({
      frame: 30,
      value: 2 * Math.PI
    });

    animWheel.setKeys(wheelKeys);

    wheelRB.animations = [];
    wheelRB.animations.push(animWheel);
    wheelRF.animations = [];
    wheelRF.animations.push(animWheel);
    wheelLB.animations = [];
    wheelLB.animations.push(animWheel);
    wheelLF.animations = [];
    wheelLF.animations.push(animWheel);

    scene.beginAnimation(wheelRB, 0, 30, true);
    scene.beginAnimation(wheelRF, 0, 30, true);
    scene.beginAnimation(wheelLB, 0, 30, true);
    scene.beginAnimation(wheelLF, 0, 30, true);

    // car 动画
    const animCar = new Animation(
      "carAnimation",
      "position.x",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const carKeys = [];
    carKeys.push({
      frame: 0,
      value: -4
    });
    carKeys.push({
      frame: 150,
      value: 4
    });
    carKeys.push({
      frame: 210,
      value: 4
    });

    animCar.setKeys(carKeys);

    car.animations = [];
    car.animations.push(animCar);

    scene.beginAnimation(car, 0, 210, true);

    return car;
  }
}
