import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class CreateRibbonWithPathLengths {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Ribbon With Path Lengths'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.groundColor = new Color3(0.2, 0.2, 0.5)
    light.intensity = 0.6

    scene.clearColor = new Color4(0.8, 0.8, 0.8, 1)

    // paths
    const path1 = []
    const path2 = []
    const path3 = []
    const path4 = []
    for (let i = -5; i < 6; i++) {
      path1.push(new Vector3(i, 2, 0))
      path2.push(new Vector3(i, 1, 0))
      path3.push(new Vector3(i - 1, -2, -1))
      path4.push(new Vector3(i + 1, -4, 1))
    }
    for (let i = 6; i < 10; i++) {
      path2.push(new Vector3(i ,1, 0))
      path3.push(new Vector3(i - 1, -2, -1))
    }

    const ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: [path1, path2, path3, path4]
    })
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.5, 1)
    mat.backFaceCulling = false
    mat.wireframe = true
    ribbon.material = mat

    const pl = new PointLight('pl', new Vector3(-20, 0, -20))
    pl.diffuse = Color3.White()
    pl.specular = Color3.Green()
    pl.intensity = 0.6

    // mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')

    return scene;
  }
}