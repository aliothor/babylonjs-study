import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class MaterialTexturesIntroduce {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Material Textures Introduce'
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
    const url = 'https://playground.babylonjs.com/textures/'
    const grass0 = new StandardMaterial('grass0Mat')
    grass0.diffuseTexture = new Texture(`${url}grass.png`)

    const grass1 = new StandardMaterial('grass1Mat')
    grass1.emissiveTexture = new Texture(`${url}grass.png`)

    const grass2 = new StandardMaterial('grass2Mat')
    grass2.ambientTexture = new Texture(`${url}grass.png`)
    grass2.diffuseColor = new Color3(1, 0, 0)

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