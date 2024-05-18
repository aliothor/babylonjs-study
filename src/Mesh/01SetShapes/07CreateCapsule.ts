import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class CreateCapsule {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Capsule'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    // const capsule = MeshBuilder.CreateCapsule('capsule', {orientation: Vector3.Forward()})
    // const capsule = MeshBuilder.CreateCapsule('capsule', {radius: 0.5, capSubdivisions: 1, height: 2, tessellation: 4, topCapSubdivisions: 12})
    const capsule = MeshBuilder.CreateCapsule('capsule', {radius: 0.05, radiusTop: 0.4})
    // const mat = new StandardMaterial('mat')
    // mat.wireframe = true
    // capsule.material = mat

    return scene;
  }
}