import { ArcRotateCamera, AxesViewer, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class ThinInstancesCustomAttributes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Thin Instances Custom Attributes'
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
    
    // 1
    // const matrix = Matrix.Translation(-2, 2, 0)

    // const idx = sphere.thinInstanceAdd(matrix, false)
    // const idx2 = sphere.thinInstanceAddSelf(false)

    // const matrix2 = Matrix.Translation(2, 1, 0)
    // sphere.thinInstanceSetMatrixAt(idx2, matrix2)

    // attibute
    // sphere.thinInstanceRegisterAttribute('color', 4)
    // sphere.thinInstanceSetAttributeAt('color', 0, [1, 1, 0, 1, 1, 0, 0, 1])

    // 2
    const matrix = Matrix.Translation(-2, 2, 0)
    const matrix2 = Matrix.Translation(2, 1, 0)
    const matrix3 = Matrix.IdentityReadOnly

    const bufferMatrices = new Float32Array(16 * 3)
    matrix.copyToArray(bufferMatrices, 0)
    matrix2.copyToArray(bufferMatrices, 16)
    matrix3.copyToArray(bufferMatrices, 32)

    const bufferColors = new Float32Array(4 * 3)
    bufferColors.set([1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1])

    sphere.thinInstanceSetBuffer('matrix', bufferMatrices, 16)
    // sphere.thinInstanceSetBuffer('color', bufferColors, 4)
    sphere.thinInstanceSetBuffer('color', bufferColors, 4, true)

    // update
    bufferColors[6] = 1
    sphere.thinInstanceBufferUpdated('color')

    // sphere.thinInstanceCount = 2

    return scene;
  }
}