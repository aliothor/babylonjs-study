import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class DifferentImagesOnPlane {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Images On A Plane'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 2, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const pl = new PointLight('pl', Vector3.Zero(), scene)
    pl.position = camera.position

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/poker.jpeg')

    const f = new Vector4(0.5, 0, 1, 1)
    const b = new Vector4(0, 0, 0.5, 1)

    const plane = MeshBuilder.CreatePlane('plane', {
      height: 1,
      width: 0.665,
      sideOrientation: Mesh.DOUBLESIDE,
      frontUVs: f,
      backUVs: b
    })
    plane.material = mat

    return scene;
  }
}