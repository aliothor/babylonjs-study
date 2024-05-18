import { ArcRotateCamera, Color3, DirectionalLight, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class SpatialDirectional {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -20));
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

    // cylinder
    const cylinder = MeshBuilder.CreateCylinder('cylinder',
      {height: 1, diameterTop: 0, diameterBottom: 1, tessellation: 15, subdivisions: 1});
    cylinder.parent = box;
    cylinder.position = new Vector3(0.5, 0, 0);
    cylinder.rotation.z = Math.PI / 2.0;

    const h = 30, innerAngle = 50, outerAngle = 160;

    const cyMat = new StandardMaterial('cyMat');
    cyMat.diffuseColor = Color3.Purple();
    cyMat.alpha = 0.3;

    const cy1 = MeshBuilder.CreateCylinder('cy1',
      {height: h, diameterTop: 0, diameterBottom: 2 * h * Math.tan(Math.PI * outerAngle / 360.0), tessellation: 20, subdivisions: 1});
    cy1.material = cyMat;
    cy1.parent = box;
    cy1.position = new Vector3(h / 2.0, 0, 0);
    cy1.rotation.z = Math.PI / 2;

    const cy2 = MeshBuilder.CreateCylinder('cy2',
      {height: h, diameterTop: 0, diameterBottom: 2 * h * Math.tan(Math.PI * innerAngle / 360.0), tessellation: 20, subdivisions: 1});
    cy2.material = cyMat;
    cy2.parent = box;
    cy2.position = new Vector3(h / 2.0, 0, 0);
    cy2.rotation.z = Math.PI / 2;

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
    music1.setDirectionalCone(innerAngle, outerAngle, 0);
    music1.setLocalDirectionToMesh(new Vector3(1, 0, 0));
    music1.attachToMesh(box);

    let alpha = 0;
    const r = 30;
    scene.registerBeforeRender(() => {
      camera.position = new Vector3(Math.cos(alpha) * r, 1, Math.sin(alpha) * r);
      alpha += 0.002;
      camera.setTarget(box.position);
    });

    return scene;
  }
}