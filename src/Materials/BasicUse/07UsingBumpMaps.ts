import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class MaterialTexturesIntroduce {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Bump Maps'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 4, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(-1, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)

    // material
    const url = '/Materials/'
    const grass0 = new StandardMaterial('grass0Mat')
    grass0.diffuseColor = new Color3(1, 0, 0)
    grass0.bumpTexture = new Texture(`${url}ground_normal.png`)

    const grass1 = new StandardMaterial('grass1Mat')
    grass1.diffuseTexture = new Texture(`${url}ground_original.png`)
    grass1.bumpTexture = new Texture(`${url}ground_normal.png`)
    grass1.invertNormalMapX = true
    grass1.invertNormalMapY = true

    const grass2 = new StandardMaterial('grass2Mat')
    grass2.diffuseTexture = new Texture(`${url}grass.png`)
    grass2.bumpTexture = new Texture(`${url}ground_normal.png`)

    // diffuse texture
    const sphere0 = MeshBuilder.CreateSphere('sphere0')
    sphere0.position.x = -1.5
    sphere0.material = grass0

    // emissive texture
    const sphere1 = MeshBuilder.CreateSphere('sphere1')
    sphere1.material = grass1

    // ambient texture
    const sphere2 = MeshBuilder.CreateSphere('sphere2')
    sphere2.material = grass2
    sphere2.position.x = 1.5

    return scene;
  }
}