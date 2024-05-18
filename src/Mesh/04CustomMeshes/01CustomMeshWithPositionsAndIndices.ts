import { ArcRotateCamera, Debug, Engine, HemisphericLight, Mesh, Scene, StandardMaterial, Vector3, VertexData } from "babylonjs";

export default class CustomMeshWithPositionsAndIndices {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Mesh With Positions And Indices'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const customMesh = new Mesh('custom')
    const positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3]
    const indices = [0, 1, 2, 3, 4, 5]

    const vertexData = new VertexData()
    vertexData.positions = positions
    vertexData.indices = indices
    vertexData.applyToMesh(customMesh)

    const mat = new StandardMaterial('mat')
    mat.backFaceCulling = false
    customMesh.material = mat

    new Debug.AxesViewer(scene, 5)

    return scene;
  }
}