import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ComparingShadingSpheres {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Comparing Shading of Spheres'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/earth.jpg')

    const sphere0 = MeshBuilder.CreateSphere('sphere0', {diameter: 3, segments: 16})
    sphere0.position.y = 2
    sphere0.material = mat

    const sphere1 = MeshBuilder.CreateSphere('sphere1', {diameter: 3, segments: 16})
    sphere1.position.y = -2
    sphere1.material = mat
    sphere1.convertToFlatShadedMesh()


    return scene;
  }
}