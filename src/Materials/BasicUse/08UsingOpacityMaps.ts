import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class UsingOpacityMaps {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Opacity Maps'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)

    const mat0 = new StandardMaterial('mat0')
    mat0.diffuseColor = new Color3(1, 0, 0)
    mat0.opacityTexture = new Texture('/Materials/degrade_map.png')

    const plane = MeshBuilder.CreatePlane('plane')
    plane.material = mat0

    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(1, 0, 1)

    const sphere = MeshBuilder.CreateSphere('sphere')
    sphere.material = mat1
    sphere.position.z = 1.5

    return scene;
  }
}