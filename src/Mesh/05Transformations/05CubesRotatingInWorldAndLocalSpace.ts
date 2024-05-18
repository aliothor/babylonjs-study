import { ArcRotateCamera, Color3, Color4, Debug, Engine, HemisphericLight, MeshBuilder, Scene, Space, Vector3 } from "babylonjs";

export default class CubesRotatingInWorldAndLocalSpace {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = '2 Cubes Rotating In World and Local Space'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3.5, 12, new Vector3(0, 0, 0));
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
    boxW.rotation.y = Math.PI / 4
    boxW.position = new Vector3(1, 2, 3)

    const boxL = boxW.createInstance('boxL')

    new Debug.AxesViewer(scene, 2)

    const axis = new Vector3(2, 6, 4)
    const drawAxis = MeshBuilder.CreateLines('vector', {
      points: [
        boxW.position.add(axis.scale(-2)),
        boxW.position.add(axis.scale(2))
      ]
    })

    const angle = 0.02
    scene.onBeforeRenderObservable.add(() => {
      boxW.rotate(axis, angle, Space.WORLD)
      boxL.rotate(axis, angle, Space.LOCAL)
    })

    return scene;
  }
}