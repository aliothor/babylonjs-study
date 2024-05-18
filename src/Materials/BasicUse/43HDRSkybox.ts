import { ArcRotateCamera, Engine, HDRCubeTexture, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class HDRSkybox {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'High Dynamic Range Skybox'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const box = MeshBuilder.CreateBox('box', {size: 1000});
    const mat = new StandardMaterial('mat')
    mat.backFaceCulling = false
    mat.reflectionTexture = new HDRCubeTexture('https://playground.babylonjs.com/textures/room.hdr', scene, 512)
    mat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    box.material = mat

    return scene;
  }
}