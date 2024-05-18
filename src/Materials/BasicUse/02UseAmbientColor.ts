import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class UseAmbientColor {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Ambient Color'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.ambientColor = new Color3(1, 1, 1)

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 4, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(-1, 1, 0), scene);
    light.diffuse = new Color3(1, 0, 0)
    light.specular = new Color3(0, 1, 0)
    light.groundColor = new Color3(0, 1, 0)

    // material
    const redMat = new StandardMaterial('redMat')
    redMat.ambientColor = new Color3(1, 0, 0)

    const greenMat = new StandardMaterial('greenMat')
    greenMat.ambientColor = new Color3(0, 1, 0)

    // no ambient color
    const sphere0 = MeshBuilder.CreateSphere('sphere0')
    sphere0.position.x = -1.5

    // red ambient color
    const sphere1 = MeshBuilder.CreateSphere('sphere1')
    sphere1.material = redMat

    // green ambient color
    const sphere2 = MeshBuilder.CreateSphere('sphere2')
    sphere2.material = greenMat
    sphere2.position.x = 1.5

    return scene;
  }
}