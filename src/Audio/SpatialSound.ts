import { ArcRotateCamera, Color3, DirectionalLight, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, StandardMaterial, Vector3 } from "babylonjs";

export default class SpatialSound {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new FreeCamera('camera', new Vector3(0, 5, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, -5, 2), scene);

    const pos1 = new Vector3(60, 0, 0);
    const pos2 = new Vector3(-100, 0, 0);
    const pos3 = new Vector3(0, 0, 100);

    // gound
    const ground = MeshBuilder.CreateGround('ground', {width: 600, height: 600});
    const groundMat = new StandardMaterial('groundMat');
    groundMat.diffuseColor = Color3.White();
    groundMat.backFaceCulling = false;
    ground.material = groundMat;
    ground.position = Vector3.Zero();

    // shpere
    const sphereMat = new StandardMaterial('sphereMat');
    sphereMat.diffuseColor = Color3.Purple();
    sphereMat.backFaceCulling = false;
    sphereMat.alpha = 0.3;

    const sphere1 = MeshBuilder.CreateSphere('s1', {segments: 20, diameter: 50});
    sphere1.material = sphereMat;
    sphere1.position = pos1;

    const sphere2 = MeshBuilder.CreateSphere('s2', {segments: 20, diameter: 200});
    sphere2.material = sphereMat;
    sphere2.position = pos2;

    const sphere3 = MeshBuilder.CreateSphere('s3', {segments: 20, diameter: 60});
    sphere3.material = sphereMat;
    sphere3.position = pos3;

    // 环境
    scene.gravity = new Vector3(0, -0.98, 0);
    scene.collisionsEnabled = true;

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1, 1, 1);

    ground.checkCollisions = true;

    const music1 = new Sound(
      'Violons11',
      'https://playground.babylonjs.com/sounds/violons11.wav',
      scene,
      null,
      {autoplay: true, loop: true, spatialSound: true, maxDistance: 25}
    );
    music1.setPosition(pos1);

    const music2 = new Sound(
      'Violons18',
      'https://playground.babylonjs.com/sounds/violons18.wav',
      scene,
      null,
      {autoplay: true, loop: true, spatialSound: true}
    );
    music2.setPosition(pos2);

    const music3 = new Sound(
      'Cellolong',
      'https://playground.babylonjs.com/sounds/cellolong.wav',
      scene,
      null,
      {autoplay: true, loop: true, spatialSound: true, maxDistance: 30}
    );
    music3.setPosition(pos3);

    return scene;
  }
}