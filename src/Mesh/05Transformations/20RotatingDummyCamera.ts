import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "babylonjs";

export default class RotatingDummyCamera {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotating Dummy Camera'
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

    // create shell for range of camera positions
    const shell = MeshBuilder.CreateSphere('shell', {diameter: 5})
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = new Color3(0, 0, 0)
    sMat.alpha = 0.2
    shell.material = sMat

    // create inner shell
    const innerShell = MeshBuilder.CreateSphere('innerShell', {diameter: 2 * Math.sqrt(2)})
    const isMat = new StandardMaterial('isMat')
    isMat.diffuseColor = new Color3(1, 1, 0)
    isMat.alpha = 0.2
    innerShell.material = isMat

    // create shpere to show intended camera position
    const dummyCam = MeshBuilder.CreateSphere('dummyCam', {diameter: 0.1})
    const dcMat = new StandardMaterial('dcMat')
    dcMat.diffuseColor = new Color3(0, 0, 0)
    dummyCam.material = dcMat
    dummyCam.position = new Vector3(0, 0, -2.5)

    // create cylinder as an additional stationary object
    const cylinder = MeshBuilder.CreateCylinder('cylinder', {diameter: 0.05, height: 0.1})
    const clMat = new StandardMaterial('clMat')
    clMat.diffuseColor = new Color3(0.2, 0.5, 1)
    cylinder.material = clMat
    cylinder.position.x = 0.2

    // create line to show direction of view of camera
    const line = MeshBuilder.CreateLines('line', {
      points: [
        // new Vector3(0, 0, 1),
        // new Vector3(0, 0, -2.5)
        new Vector3(0, 0, 0),
        new Vector3(1, 0, -1)
      ]
    })
    line.color = new Color3(1, 0, 1)

    // create tube
    const tube = MeshBuilder.CreateTube('tube', {
      path: [
        // new Vector3(0, 0, 1),
        // new Vector3(0, 0, -2.5)
        new Vector3(0, 0, 0),
        new Vector3(1, 0, -1)
      ],
      sideOrientation: Mesh.DOUBLESIDE,
      radius: 1.5
    })
    const tbMat = new StandardMaterial('tbMat')
    tbMat.diffuseColor = new Color3(1, 0, 1)
    tbMat.alpha = 0.2
    tube.material = tbMat

    // create box
    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {size: 0.25, faceColors})

    // create a center of transfromation
    const cot = new TransformNode('root')
    line.parent = cot
    dummyCam.parent = cot
    tube.parent = cot

    // cot.position.x = 1
    // shell.position.x = 1
    dummyCam.position.x = 1
    dummyCam.position.z = -1

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