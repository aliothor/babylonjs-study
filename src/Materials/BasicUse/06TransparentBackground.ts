import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class TransparentBackground {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Transparent Background'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://doc.babylonjs.com/img/how_to/Materials/dog.png')
    mat.diffuseTexture.hasAlpha = true
    mat.backFaceCulling = false
    const box = MeshBuilder.CreateBox('box');
    box.material = mat

    return scene;
  }
}