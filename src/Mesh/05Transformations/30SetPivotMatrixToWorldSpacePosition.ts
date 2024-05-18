import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class SetPivotMatrixToWorldSpacePosition {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Set Pivot Matrix to A World Space Position'
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

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {faceColors, size: 2});
    box.material = new StandardMaterial('boxMat')
    box.material.wireframe = true

    // create marker for box local origin
    const sphereLocalOrigin = MeshBuilder.CreateSphere('sphereLocalOrigin', {diameter: 0.5})
    const sloMat = new StandardMaterial('sloMat')
    sloMat.diffuseColor = new Color3(1, 1, 0)
    sphereLocalOrigin.material = sloMat
    sphereLocalOrigin.parent = box

    // create marker for pivot
    const spherePivot = MeshBuilder.CreateSphere('spherePivot', {diameter: 0.5})
    const spMat = new StandardMaterial('spMat')
    spMat.diffuseColor = new Color3(1, 0, 0)
    spherePivot.material = spMat

    new AxesViewer()

    box.position = new Vector3(1, 0, 0)
    box.rotation = new Vector3(-Math.PI / 4, -Math.PI / 6, -Math.PI / 3)

    // set pivot at world space
    const pivotAt = new Vector3(1, 1, 1)

    // const relativePos = pivotAt.subtract(box.position)
    // box.setPivotPoint(relativePos)
    const translation = box.position.subtract(pivotAt)
    box.setPivotMatrix(Matrix.Translation(translation.x, translation.y, translation.z))
    spherePivot.position = pivotAt

    // animation
    let angle = 0
    scene.onBeforeRenderObservable.add(() => {
      box.rotation.y = angle
      angle += 0.01
    })


    return scene;
  }
}