import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class DrawingImage {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing A Image'
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

    const ground = MeshBuilder.CreateGround('ground', {width: 20, height: 10, subdivisions: 25})

    // create dynamic texture
    const textureGround = new DynamicTexture('dynamic texture', 512)

    const gMat = new StandardMaterial('gMat')
    gMat.diffuseTexture = textureGround
    ground.material = gMat

    // draw curves on canvas
    const ctx = textureGround.getContext()
    const img = new Image()
    img.src = '/Materials/grass.png'
    img.onload = function() {
      ctx.drawImage(this, 0, 0)
      textureGround.update()

      ctx.drawImage(this, 150, 100, 100, 50, 256, 256, 200, 220)
      textureGround.update()
    }

    return scene;
  }
}