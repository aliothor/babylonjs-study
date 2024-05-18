import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, TransformNode, Vector3 } from "babylonjs";

export default class BoxTranslationScaling {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Box Translation and Scaling'
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

    const box = MeshBuilder.CreateBox('box', {faceColors});

    // create a center of transformation
    const cot = new TransformNode('root')
    box.parent = cot

    const axis = new AxesViewer()
    axis.xAxis.parent = cot
    axis.yAxis.parent = cot
    axis.zAxis.parent = cot

    // animation
    let angle = 0
    scene.onBeforeRenderObservable.add(() => {
      cot.rotation.y = angle
      box.position.x += 0.0025
      box.scaling.x += 0.0025
      angle += 0.01
    })
    

    return scene;
  }
}