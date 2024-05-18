import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class BakingUsingMatrices {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Baking Using Matrices'
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

    const box = MeshBuilder.CreateBox('box');
    const translateMatrix = Matrix.Translation(0, 1, 0)
    const scaleMatrix = Matrix.Scaling(1.5, 0.5, 1)
    const matrix = scaleMatrix.multiply(translateMatrix)
    box.bakeTransformIntoVertices(matrix)
    box.rotation.z = -Math.PI / 2

    new AxesViewer()

    return scene;
  }
}