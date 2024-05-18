import { ArcRotateCamera, Engine, HemisphericLight, Material, Matrix, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class ThinInstancesWrongAndCorrectRendering {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Thin Instances Wrong and Correct Rendering'
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
    light.intensity = 0.7

    const box = MeshBuilder.CreateBox('box');
    box.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})

    // matrix
    const m1 = Matrix.Translation(-2, 2, 0)
    const m2 = Matrix.IdentityReadOnly
    const m3 = Matrix.Compose(new Vector3(-1, 1, 1), Quaternion.Identity(), new Vector3(2, 1, 0))
    const m4 = Matrix.Compose(new Vector3(-1, 1, 1), Quaternion.Identity(), new Vector3(-2, 0, -3))

    const bufferMatrices = new Float32Array(16 * 2)
    m1.copyToArray(bufferMatrices, 0)
    m2.copyToArray(bufferMatrices, 16)

    const bufferColors = new Float32Array(4 * 2)
    bufferColors.set([1, 1, 0, 1, 1, 0, 0, 1])

    box.thinInstanceSetBuffer('matrix', bufferMatrices)
    box.thinInstanceSetBuffer('color', bufferColors, 4, true)

    // scale -1
    const box2 = MeshBuilder.CreateBox('box2')
    box2.position.y = 1

    const bufferMatrices2 = new Float32Array(16 * 2)
    m3.copyToArray(bufferMatrices2, 0)
    m4.copyToArray(bufferMatrices2, 16)

    const bufferColors2 = new Float32Array(4 * 2)
    bufferColors2.set([0, 1, 0, 1, 0, 0, 1, 1])

    box2.thinInstanceSetBuffer('matrix', bufferMatrices2)
    box2.thinInstanceSetBuffer('color', bufferColors2, 4, true)

    const mat2 = new StandardMaterial('mat2')
    mat2.sideOrientation = Material.ClockWiseSideOrientation
    box2.material = mat2


    return scene;
  }
}