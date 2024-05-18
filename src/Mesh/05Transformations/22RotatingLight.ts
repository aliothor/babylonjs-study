import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SpotLight, StandardMaterial, TransformNode, Vector3 } from "babylonjs";

export default class RotatingLight {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotating Light'
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
    light.intensity = 0.5

    const faceColors: Color4[] = []
    faceColors[0] = Color4.FromColor3(Color3.Blue())
    faceColors[1] = Color4.FromColor3(Color3.Red())
    faceColors[2] = Color4.FromColor3(Color3.Green())
    faceColors[3] = Color4.FromColor3(Color3.White())
    faceColors[4] = Color4.FromColor3(Color3.Yellow())
    faceColors[5] = Color4.FromColor3(Color3.Magenta())

    const box = MeshBuilder.CreateBox('box', {faceColors});

    // light to rotate
    // const rotateLight = new PointLight('rotateLight', new Vector3(1, 1, 0))
    const rotateLight = new SpotLight('rotateLight', new Vector3(1, 0.6, 0), new Vector3(-1, 0, 0), Math.PI / 2, 4)

    // create sphere
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.1})
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = new Color3(1, 0, 1)
    sphere.material = sMat

    // create a center of transformation
    const cot = new TransformNode('root')
    sphere.parent = rotateLight
    rotateLight.parent = cot

    // animation
    let angle = 0
    scene.onBeforeRenderObservable.add(() => {
      cot.rotation.y = angle
      angle += 0.01
    })

    return scene;
  }
}