import { ArcRotateCamera, Color3, DirectionalLight, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class AttachtoMesh {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -70));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, -5, 2), scene);

    // gound
    const ground = MeshBuilder.CreateGround('ground', {width: 600, height: 600});
    const groundMat = new StandardMaterial('groundMat');
    groundMat.diffuseColor = Color3.White();
    groundMat.backFaceCulling = false;
    ground.material = groundMat;
    ground.position = Vector3.Zero();

    // box
    const boxMat = new StandardMaterial('boxMat');
    boxMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/crate.png');

    const box = MeshBuilder.CreateBox('box');
    box.material = boxMat;
    box.position = new Vector3(0, 1, 0);

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
      {autoplay: true, loop: true}
    );
    music1.attachToMesh(box);

    let alpha = 0;
    const r = 30;
    scene.registerBeforeRender(() => {
      box.position = new Vector3(Math.cos(alpha) * r, 1, Math.sin(alpha) * r);
      alpha += 0.01;
    });

    return scene;
  }
}