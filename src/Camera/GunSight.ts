import { ArcRotateCamera, Camera, Color3, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class GunSight {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box');
    box.position.y = 0.5;
    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    this._addGunSight(scene);

    return scene;
  }
  private _addGunSight(scene: Scene) {
    if (scene.activeCameras?.length == 0) {
      scene.activeCameras.push(scene.activeCamera!);
    }

    // 添加一个正交相机
    const camera2 = new FreeCamera('camera2', new Vector3(0, 0, -200));
    camera2.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera2.layerMask = 0x20000000;
    scene.activeCameras?.push(camera2);

    // 创建十字
    const meshes: Mesh[] = [];
    const h = 250;
    const w = 250;

    const y = MeshBuilder.CreateBox('y', {size: h * .2});
    y.scaling = new Vector3(0.05, 1, 1);
    y.position = new Vector3(0, 0, 0);
    meshes.push(y);

    const x = MeshBuilder.CreateBox('x', {size: h * .2});
    x.scaling = new Vector3(1, 0.05, 1);
    x.position = new Vector3(0, 0, 0);
    meshes.push(x);

    const lineTop = MeshBuilder.CreateBox("lineTop", { size: w * 0.8 }, scene);
    lineTop.scaling = new Vector3(1, 0.005, 1);
    lineTop.position = new Vector3(0, h * 0.5, 0);
    meshes.push(lineTop);

    const gunSight = Mesh.MergeMeshes(meshes) as Mesh;
    gunSight.name = 'gunSight';
    gunSight.layerMask = 0x20000000;

    const mat = new StandardMaterial('emissive mat');
    mat.checkReadyOnlyOnce = true;
    mat.emissiveColor = new Color3(0, 1, 0);

    gunSight.material = mat;

  }
}