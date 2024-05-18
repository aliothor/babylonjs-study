import { ArcRotateCamera, AxesViewer, Axis, Color3, Color4, Debug, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Space, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class DiscWorld {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Disc World'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3.5, 80, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const disc = MeshBuilder.CreateCylinder('disc', {diameter: 20, height: 0.25})
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/grass.png')
    disc.material = mat

    const box = []
    for (let i = 0; i < 50; i++) {
      box[i] = MeshBuilder.CreateBox('box' + i, { faceColors })
      const scale = 1 + Math.random() * 2
      const radius = Math.random() * 9
      const theta = Math.random() * 2 * Math.PI
      box[i].scaling.y = scale
      box[i].rotation.y = Math.random() * 2 * Math.PI
      box[i].position = new Vector3(radius * Math.cos(theta), scale / 2, radius * Math.sin(theta))
    }
    const boxes = Mesh.MergeMeshes(box)!
    const boxesPos = boxes?.position.clone()

    let matrix
    let phi = 0
    scene.onAfterRenderObservable.add(() => {
      disc.rotate(Axis.Y, Math.PI / 150, Space.LOCAL)
      disc.rotate(Axis.X, Math.PI / 200, Space.LOCAL)
      disc.position = new Vector3(15 * Math.cos(phi), 16 * Math.sin(phi), 5)
      boxes.rotationQuaternion = disc.rotationQuaternion
      matrix = disc.getWorldMatrix()
      phi += 0.01
      boxes.position = Vector3.TransformCoordinates(boxesPos, matrix)
    })

    return scene;
  }
}