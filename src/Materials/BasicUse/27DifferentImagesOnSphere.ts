import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class DifferentImagesOnSphere {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Images On A Sphere'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 1, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene);

    const f = new Vector4(0.5, 0, 1, 1)
    const b = new Vector4(0, 0, 0.5, 1)

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/poker.jpeg')

    const s = MeshBuilder.CreateSphere('s', {
      diameter: 10,
      sideOrientation: Mesh.DOUBLESIDE,
      frontUVs: f,
      backUVs: b
    })
    s.material = mat
    

    return scene;
  }
}