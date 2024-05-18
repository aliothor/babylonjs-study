import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3, VertexBuffer, VertexData } from "babylonjs";

export default class UseWithScaling {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Use With Scaling'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere', { updatable: true })
    sphere.scaling = new Vector3(0.5, 2, 0.8)
    sphere.bakeCurrentTransformIntoVertices()

    const positions = sphere.getVerticesData(VertexBuffer.PositionKind)
    const indices = sphere.getIndices()
    const normals = sphere.getVerticesData(VertexBuffer.NormalKind)!
    VertexData.ComputeNormals(positions, indices, normals)
    sphere.updateVerticesData(VertexBuffer.NormalKind, normals)

    return scene;
  }
}