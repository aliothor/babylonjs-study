import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Plane, RefractionTexture, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class ChangingRefractionParams {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Changing Refraction Params'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // mesh
    const sphere = MeshBuilder.CreateSphere('sphere')
    sphere.position.z = 6
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = new Color3(1, 0, 1)
    sphere.material = sMat

    // create a water plane
    const water = MeshBuilder.CreatePlane('water', {size: 15})

    // create the water material
    const wMat = new StandardMaterial('sMat')
    wMat.diffuseColor = new Color3(1, 1, 1)
    const refracTex = new RefractionTexture('refracTex', 1024)
    refracTex.refractionPlane = new Plane(0, 0, -1, 1)
    refracTex.renderList = [sphere]
    refracTex.depth = 50
    wMat.refractionTexture = refracTex
    wMat.indexOfRefraction = 0.5
    wMat.alpha = 0.5
    water.material = wMat

    return scene;
  }
}