import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3, VRDeviceOrientationArcRotateCamera, VRDeviceOrientationFreeCamera, VRDeviceOrientationGamepadCamera } from "babylonjs";

export default class VRDeviceOrientationUsed {
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

    // const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    // const camera = new ArcRotateCamera('camera', 0, 0, 8, new Vector3(0, 0, 0));
    // const camera = new VRDeviceOrientationFreeCamera('camera', new Vector3(0, 2, -8));
    // const camera = new VRDeviceOrientationArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    const camera = new VRDeviceOrientationGamepadCamera('camera', new Vector3(0, 2, -8));
    camera.attachControl(this.canvas, true);
    // camera.attachControl(this.canvas, true, false);
    // camera.position = new Vector3(0, 2, -8);
    // camera.setTarget(Vector3.Zero());

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // 材料
    const redMat = new StandardMaterial('red');
    redMat.diffuseColor = Color3.Red();
    redMat.emissiveColor = Color3.Red();
    redMat.specularColor = Color3.Red();

    const greenMat = new StandardMaterial('green');
    greenMat.diffuseColor = Color3.Green();
    greenMat.emissiveColor = Color3.Green();
    greenMat.specularColor = Color3.Green();

    const blueMat = new StandardMaterial('blue');
    blueMat.diffuseColor = Color3.Blue();
    blueMat.emissiveColor = Color3.Blue();
    blueMat.specularColor = Color3.Blue();

    // 平面
    const pRed = MeshBuilder.CreatePlane('pRed', {size: 2, sideOrientation: Mesh.DOUBLESIDE});
    pRed.position.x = -3;
    pRed.position.z = 0;
    pRed.material = redMat;

    const pGreen = MeshBuilder.CreatePlane('pGreen', {size: 2, sideOrientation: Mesh.DOUBLESIDE});
    pGreen.position.x = 3;
    pGreen.position.z = -1.5;
    pGreen.material = greenMat;

    const pBlue= MeshBuilder.CreatePlane('pBlue', {size: 2, sideOrientation: Mesh.DOUBLESIDE});
    pBlue.position.x = 3;
    pBlue.position.z = 1.5;
    pBlue.material = blueMat;

    const ground = MeshBuilder.CreateGround('ground', {height: 6, width: 6});

    return scene;
  }
}