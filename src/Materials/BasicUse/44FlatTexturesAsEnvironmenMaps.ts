import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class FlatTexturesAsEnvironmenMaps {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Flat Textures as Environmen Maps'
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

    // skybox
    const box = MeshBuilder.CreateBox('box', {size: 1000});
    const bMat = new StandardMaterial('bMat')
    bMat.backFaceCulling = false
    bMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/Space/space_', scene, ['right.jpg', 'up.jpg', 'front.jpg', 'left.jpg', 'down.jpg', 'back.jpg'])
    bMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    bMat.diffuseColor = new Color3(0, 0, 0)
    bMat.specularColor = new Color3(0, 0, 0)
    box.material = bMat

    // sphere
    const sphere = MeshBuilder.CreateSphere('sphere')
    const sMat = new StandardMaterial('sMat')
    sMat.backFaceCulling = true
    sMat.reflectionTexture = new Texture('/Materials/MonaLisa.jpeg')
    sMat.reflectionTexture.coordinatesMode = Texture.PLANAR_MODE
    sMat.diffuseColor = new Color3(0, 0, 0)
    sMat.specularColor = new Color3(0, 0, 0)
    sphere.material = sMat

    return scene;
  }
}