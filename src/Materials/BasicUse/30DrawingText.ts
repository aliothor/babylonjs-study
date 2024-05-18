import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class DrawingText {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing Text'
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

    const ground = MeshBuilder.CreateGround('ground', {width: 20, height: 6, subdivisions: 25})

    // create dynamic texture
    const textureGround = new DynamicTexture('dynamic texture', {width: 512, height: 256})

    const gMat = new StandardMaterial('gMat')
    gMat.diffuseTexture = textureGround
    ground.material = gMat

    // add text to dynamic texture
    const font = 'bold 44px luke快写'
    textureGround.drawText('Grass', 50, 75, font, 'green', 'white', true, true)

    return scene;
  }
}