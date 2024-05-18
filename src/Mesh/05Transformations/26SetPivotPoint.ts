import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class SetPivotPoint {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Set Pivot Point'
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
    spherePivot.position = new Vector3(-1, -1, -1)
    spherePivot.parent = box

    new AxesViewer()

    box.setPivotPoint(new Vector3(-1, -1, -1))
    box.position = new Vector3(1, 2, 3)
    box.rotation = new Vector3(-Math.PI / 4, -Math.PI / 6, -Math.PI / 3)

    // animation
    let angle = 0
    scene.onBeforeRenderObservable.add(() => {
      box.rotation.y = angle
      angle += 0.01
    })


    return scene;
  }
}