import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, VertexBuffer } from "babylonjs";

export default class CloningExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Cloning Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box', {height: 1, width: 0.75, depth: 0.25, updatable: true});
    const box1 = box.clone('box1')
    box.position.x = -1
    box1.position.x = 1
    // let positions = box.getVerticesData(VertexBuffer.PositionKind)!
    // positions = positions?.map(v => 2 * v)
    // box.updateVerticesData(VertexBuffer.PositionKind, positions)

    box1.scaling = new Vector3(2, 2, 2)

    const url = 'https://playground.babylonjs.com/textures/'
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture(url + 'grass.png')
    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseTexture = new Texture(url + 'crate.png')

    box.material = mat
    box1.material = mat1

    return scene;
  }
}