import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class CreateCylinder {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Cylinder'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    // const cylinder = MeshBuilder.CreateCylinder('cylinder', {diameterTop: 0, tessellation: 3})
    // const cylinder = MeshBuilder.CreateCylinder('cylinder', {arc: 0.6, sideOrientation: Mesh.DOUBLESIDE})
    // const cylinder = MeshBuilder.CreateCylinder('cylinder', {arc: 0.1, height: 0.3, enclose: true})

    const mat = new StandardMaterial('mat')
    // mat.wireframe = true
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/logo_label.jpg')
    const faceUV = [
      new Vector4(0, 0, 0, 0),
      new Vector4(1, 0, 0.25, 1),
      new Vector4(0, 0, 0.24, 1)
    ]
    const faceColors = [
      new Color4(0.5, 0.5, 0.5, 1),
    ]
    const cylinder = MeshBuilder.CreateCylinder('cylinder', {height: 1.16, faceUV: faceUV, faceColors: faceColors})
    cylinder.material = mat

    return scene;
  }
}