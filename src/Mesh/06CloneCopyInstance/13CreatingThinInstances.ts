import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CreatingThinInstances {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Creating Thin Instances'
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

    new AxesViewer()

    const sphere = MeshBuilder.CreateSphere('sphere');
    sphere.doNotSyncBoundingInfo = true
    
    const matrix = Matrix.Translation(-2, 2, 0)

    const idx = sphere.thinInstanceAdd(matrix, false)
    const idx2 = sphere.thinInstanceAddSelf(false)

    const matrix2 = Matrix.Translation(2, 1, 0)
    sphere.thinInstanceSetMatrixAt(idx2, matrix2)

    sphere.showBoundingBox = true

    return scene;
  }
}