import { ArcRotateCamera, Axis, Color3, Color4, Debug, Engine, HemisphericLight, MeshBuilder, Quaternion, Scene, Space, Vector3 } from "babylonjs";

export default class YXZYawPitchRoll {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'YXZ Yaw Pitch Roll'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3.5, 6, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const boxW = MeshBuilder.CreateBox('boxW', {faceColors})

    const boxL = boxW.createInstance('boxL')
    boxL.scaling = new Vector3(1.5, 0.5, 1.5)

    new Debug.AxesViewer(scene, 2)

    // 1
    // randomise angles
    // const yaw = Math.random() * 2 * Math.PI
    // const pitch = Math.random() * 2 * Math.PI
    // const roll = Math.random() * 2 * Math.PI

    // rotate
    // locale
    // boxW.rotate(Axis.Y, yaw, Space.LOCAL)
    // boxW.rotate(Axis.X, pitch, Space.LOCAL)
    // boxW.rotate(Axis.Z, roll, Space.LOCAL)

    // boxL.rotation = new Vector3(pitch, yaw, roll)
    // 3
    // boxL.rotationQuaternion = Quaternion.RotationYawPitchRoll(yaw, pitch, roll)

    // 2
    const alpha = Math.random() * 2 * Math.PI
    const beta = Math.random() * 2 * Math.PI
    const gamma = Math.random() * 2 * Math.PI

    // boxW.rotate(Axis.Z, gamma, Space.WORLD)
    // boxW.rotate(Axis.X, alpha, Space.WORLD)
    // boxW.rotate(Axis.Y, beta, Space.WORLD)

    // boxL.rotation = new Vector3(alpha, beta, gamma)
    // 4
    boxW.rotate(Axis.Z, alpha, Space.WORLD)
    boxW.rotate(Axis.X, beta, Space.WORLD)
    boxW.rotate(Axis.Z, gamma, Space.WORLD)

    boxL.rotationQuaternion = Quaternion.RotationAlphaBetaGamma(alpha, beta, gamma)

    return scene;
  }
}