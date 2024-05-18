import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
  Animation,
  CubeTexture,
  Color3,
  SpriteManager,
  Sprite,
  SpotLight,
  DirectionalLight,
  Axis,
  Space,
  Tools,
  ShadowGenerator,
  FollowCamera,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  Control,
  Slider,
  StackPanel,
  TextBlock,
} from "babylonjs-gui";
import "babylonjs-loaders";
import Fountain from "../commponets/Fountain";

export default class BetterEnvironment {
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

    // const camera = new ArcRotateCamera(
    //   "camera",
    //   Math.PI / 2,
    //   Math.PI / 2.5,
    //   150,
    //   new Vector3(0, 60, 0)
    // );
    // camera.attachControl(this.canvas, true);
    // camera.upperBetaLimit = Math.PI / 2.2;
    const camera = new FollowCamera("followCamera", new Vector3(-6, 0, 0));
    camera.radius = 1;
    camera.heightOffset = 8;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.005;
    camera.maxCameraSpeed = 10;

    // const light = new HemisphericLight(
    //   "light",
    //   new Vector3(1, 1, 0),
    //   this.scene
    // );
    // light.intensity = 1;

    const light = new DirectionalLight("dir1", new Vector3(0, -1, 1), scene);
    light.position = new Vector3(0, 50, -100);

    //
    const shadowGenerator = new ShadowGenerator(1024, light);

    SceneLoader.ImportMeshAsync(
      "him",
      "https://playground.babylonjs.com/scenes/Dude/",
      "Dude.babylon"
    ).then((result) => {
      var dude = result.meshes[0];
      dude.scaling = new Vector3(0.008, 0.008, 0.008);

      shadowGenerator.addShadowCaster(dude, true);

      dude.position = new Vector3(-6, 0, 0);
      dude.rotate(Axis.Y, Tools.ToRadians(-95), Space.LOCAL);
      const startRotation = dude.rotationQuaternion!.clone();

      // camera.parent = dude;
      camera.lockedTarget = dude;
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
      track.push(new walk(86, 7));
      track.push(new walk(-85, 14.8));
      track.push(new walk(-93, 16.5));
      track.push(new walk(48, 25.5));
      track.push(new walk(-112, 30.5));
      track.push(new walk(-72, 33.2));
      track.push(new walk(42, 37.5));
      track.push(new walk(-98, 45.2));
      track.push(new walk(0, 47));

      let distance = 0;
      let step = 0.015;
      let p = 0;

      scene.onBeforeRenderObservable.add(() => {
        dude.movePOV(0, 0, step);
        distance += step;

        if (distance > track[p].dist) {
          dude.rotate(Axis.Y, Tools.ToRadians(track[p].turn), Space.LOCAL);
          p += 1;
          p %= track.length;
          if (p === 0) {
            distance = 0;
            dude.position = new Vector3(-6, 0, 0);
            dude.rotationQuaternion = startRotation.clone();
          }
        }
      });
    });

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const panel = new StackPanel();
    panel.width = "220px";
    panel.top = "-25px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(panel);

    const header = new TextBlock();
    header.text = "Night to Day";
    header.height = "30px";
    header.color = "white";
    panel.addControl(header);

    const slider = new Slider();
    slider.minimum = 0;
    slider.maximum = 1;
    slider.borderColor = "black";
    slider.color = "gray";
    slider.background = "white";
    slider.value = 1;
    slider.height = "20px";
    slider.width = "200px";
    slider.onValueChangedObservable.add((value) => {
      if (light) {
        light.intensity = value;
      }
    });
    panel.addControl(slider);

    const fountain = new Fountain(scene);

    // 天空盒子
    const skybox = MeshBuilder.CreateBox("skybox", { size: 150 });
    const skyboxMat = new StandardMaterial("skyboxMat");
    skyboxMat.backFaceCulling = false;
    skyboxMat.reflectionTexture = new CubeTexture(
      "https://playground.babylonjs.com/textures/skybox",
      scene
    );
    skyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMat.diffuseColor = new Color3(0, 0, 0);
    skyboxMat.specularColor = new Color3(0, 0, 0);

    skybox.material = skyboxMat;

    // https://assets.babylonjs.com/environments/villagegreen.png
    // const groundMat = new StandardMaterial("groundMat");
    // groundMat.diffuseTexture = new Texture(
    //   "https://assets.babylonjs.com/environments/villagegreen.png"
    // );
    // groundMat.diffuseTexture.hasAlpha = true;

    // const ground = MeshBuilder.CreateGround("ground", {
    //   width: 24,
    //   height: 24
    // });
    // ground.material = groundMat;

    //Create large ground for valley environment
    // https://assets.babylonjs.com/environments/valleygrass.png
    // const largeGroundMat = new StandardMaterial("largeGroundMat");
    // largeGroundMat.diffuseTexture = new Texture(
    //   "https://assets.babylonjs.com/environments/valleygrass.png"
    // );

    // const largeGround = MeshBuilder.CreateGroundFromHeightMap(
    //   "largeGround",
    //   "https://assets.babylonjs.com/environments/villageheightmap.png",
    //   { width: 150, height: 150, subdivisions: 20, minHeight: 0, maxHeight: 10 }
    // );
    // largeGround.material = largeGroundMat;
    // largeGround.position.y = -0.01;

    // valleyvillage
    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "valleyvillage.glb"
    ).then(() => {
      const ground = scene.getMeshByName("ground")!;
      ground.receiveShadows = true;
    });

    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "car.glb"
    ).then(() => {
      const car = scene.getMeshByName("car")!;
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
        value: 8,
      });

      carKeys.push({
        frame: 150,
        value: -7,
      });

      carKeys.push({
        frame: 200,
        value: -7,
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

    // https://playground.babylonjs.com/textures/palm.png
    // https://assets.babylonjs.com/environments/ufo.png
    // 种树
    const spriteManagerTrees = new SpriteManager(
      "spriteManageTrees",
      "https://playground.babylonjs.com/textures/palm.png",
      2000,
      { width: 512, height: 1024 },
      scene
    );

    for (let i = 0; i < 500; i++) {
      const tree = new Sprite("tree", spriteManagerTrees);
      tree.position = new Vector3(
        Math.random() * -30,
        0.5,
        Math.random() * 20 + 8
      );
    }
    for (let i = 0; i < 500; i++) {
      const tree = new Sprite("tree", spriteManagerTrees);
      tree.position = new Vector3(
        Math.random() * 25 + 7,
        0.5,
        Math.random() * -30 + 8
      );
    }

    // ufo
    const spriteManageUFO = new SpriteManager(
      "ufo",
      "https://assets.babylonjs.com/environments/ufo.png",
      1,
      { width: 128, height: 76 },
      scene
    );
    const ufo = new Sprite("ufo", spriteManageUFO);
    ufo.playAnimation(0, 16, true, 125);
    ufo.position = new Vector3(0, 5, 0);
    ufo.width = 2;
    ufo.height = 1;

    // 路灯
    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "lamp.babylon"
    ).then(() => {
      const lampLight = new SpotLight(
        "lampLight",
        Vector3.Zero(),
        new Vector3(0, -1, 0),
        0.8 * Math.PI,
        0.01,
        scene
      );
      lampLight.diffuse = Color3.Yellow();
      lampLight.parent = scene.getMeshByName("bulb");

      const lamp = scene.getMeshByName("lamp")!;
      lamp.position = new Vector3(2, 0, 2);
      lamp.rotation = Vector3.Zero();
      lamp.rotation.y = -Math.PI / 4;

      const lamp3 = lamp.clone("lamp3", null)!;
      lamp3.position.z = -8;

      const lamp1 = lamp.clone("lamp1", null)!;
      lamp1.position.x = -8;
      lamp1.position.z = 1.2;
      lamp1.rotation.y = Math.PI / 2;

      const lamp2 = lamp1.clone("lamp2", null)!;
      lamp2.position.x = -2.7;
      lamp2.position.z = 0.8;
      lamp2.rotation.y = -Math.PI / 2;
    });

    return scene;
  }
}
