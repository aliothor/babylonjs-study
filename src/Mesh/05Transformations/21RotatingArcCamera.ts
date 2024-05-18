import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "babylonjs";

export default class RotatingArcCamera {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotating Arc Camera'
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

    scene.clearColor = Color4.FromInts(128, 128, 128, 255)

    // create cylinder as an additional stationary object
    const cylinder = MeshBuilder.CreateCylinder('cylinder', {diameter: 0.05, height: 0.1})
    const clMat = new StandardMaterial('clMat')
    clMat.diffuseColor = new Color3(0.2, 0.5, 1)
    cylinder.material = clMat
    cylinder.position.x = 2

    // create box
    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {size: 1, faceColors})

    // create a center of transfromation
    const cot = new TransformNode('root')

    camera.parent = cot

    // animation
    let angle = 0
    scene.onBeforeRenderObservable.add(() => {
      cot.rotation.x = angle
      cot.rotation.y = angle
      angle += 0.01
    })

    return scene;
  }
}