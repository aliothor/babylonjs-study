import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class TransparentTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Transparent Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, 3 * Math.PI / 8, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(-1, 1, 0), scene);
    light.diffuse = new Color3(1, 0, 0)
    light.specular = new Color3(0, 1, 0)
    light.groundColor = new Color3(0, 1, 0)

    // material
    const url = 'https://playground.babylonjs.com/textures/'
    const redMat = new StandardMaterial('redMat')
    redMat.diffuseTexture = new Texture(`${url}grass.png`)

    const greenMat = new StandardMaterial('greenMat')
    greenMat.diffuseTexture = new Texture(`${url}grass.png`)
    greenMat.alpha = 0.5

    // red color
    const sphere1 = MeshBuilder.CreateSphere('sphere1')
    sphere1.material = redMat
    sphere1.position.z = 1.5

    // green color
    const sphere2 = MeshBuilder.CreateSphere('sphere2')
    sphere2.material = greenMat

    return scene;
  }
}