import { ArcRotateCamera, Axis, Color3, Color4, Debug, Engine, HemisphericLight, MeshBuilder, Scene, Space, Vector3 } from "babylonjs";

export default class ConvertingEulerToQuaternionAlignment {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Converting Euler to Quaternion Alignment'
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

    const axes = [Axis.X, Axis.Y, Axis.Z]
    const spaces = [Space.WORLD, Space.LOCAL]

    // randomise axes
    let rndA = Math.floor(Math.random() * 3)
    const A1 = axes[rndA]
    axes.splice(rndA, 1)
    rndA = Math.floor(Math.random() * 2)
    const A2 = axes[rndA]
    axes.splice(rndA, 1)
    const A3 = axes[0]

    // randomise spaces
    const rndSpace = spaces[Math.floor(Math.random() * 2)]

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[6] = Color4.FromColor3(Color3.Magenta())

    // create random Euler angles
    const alpha = Math.random() * 2 * Math.PI
    const beta = Math.random() * 2 * Math.PI
    const gamma = Math.random() * 2 * Math.PI

    const box = MeshBuilder.CreateBox('box', {faceColors});

    // apply Euler angles to box and form a rotation quaternion for the box
    box.rotate(A1, alpha, rndSpace)
    box.rotate(A2, beta, rndSpace)
    box.rotate(A3, gamma, rndSpace)

    // obtain Euler angles form rotation quaternion
    const euler = box.rotationQuaternion?.toEulerAngles()

    const box1 = MeshBuilder.CreateBox('box1', {width: 1.5, depth: 1.5, height: 0.5, faceColors})
    box1.rotation = new Vector3(euler?.x, euler?.y, euler?.z)

    new Debug.AxesViewer()

    return scene;
  }
}