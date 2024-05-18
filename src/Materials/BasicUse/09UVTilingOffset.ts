import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class UVTilingOffset {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'UV Tiling and Offset'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // plane 0
    const mat0 = new StandardMaterial('mat0')
    mat0.diffuseTexture = new Texture('/Materials/box.png')

    const plane0 = MeshBuilder.CreatePlane('plane0')
    plane0.material = mat0
    plane0.position.x = -1.5

    // plane 1
    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseTexture = new Texture('/Materials/box.png')
    mat1.diffuseTexture.uScale = 2
    mat1.diffuseTexture.vScale = 4

    const plane1 = MeshBuilder.CreatePlane('plane1')
    plane1.material = mat1

    // plane 2
    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseTexture = new Texture('/Materials/box.png')
    mat2.diffuseTexture.uOffset = 0.25
    mat2.diffuseTexture.vOffset = 0.4

    const plane2 = MeshBuilder.CreatePlane('plane2')
    plane2.material = mat2
    plane2.position.x = 1.5
    
    return scene;
  }
}