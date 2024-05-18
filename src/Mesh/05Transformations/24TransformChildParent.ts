import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class TransformChildParent {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Transform Child and Parent'
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

    // colors
    const faceColors = []
    faceColors[1] = Color4.FromColor3(Color3.Purple()) 
    const faceColors1 = []
    faceColors1[1] = Color4.FromColor3(Color3.Red()) 
    const faceColors2 = []
    faceColors2[1] = Color4.FromColor3(Color3.Green()) 
    const faceColors3 = []
    faceColors3[1] = Color4.FromColor3(Color3.Blue()) 

    const box = MeshBuilder.CreateBox('box', {faceColors});
    const small1 = MeshBuilder.CreateBox('small1', {width: 0.25, depth: 0.5, height: 0.75, faceColors: faceColors1})
    const small2 = MeshBuilder.CreateBox('small2', {width: 0.5, depth: 0.25, height: 1.25, faceColors: faceColors2})
    const small3 = MeshBuilder.CreateBox('small3', {width: 0.75, depth: 0.125, height: 2, faceColors: faceColors3})

    // axis
    new AxesViewer()

    // 父子关系 -> 子变换 -> 父变换
    // 子变换 -> 父子关系 -> 父变换
    // --------- 属性确定父子关系（全部变换）；方法确定父子关系（影响关系确定后的变换）
    // 父变换 -> 父子关系 -> 子变换 
    // 父变换 -> 子变换 -> 父子关系 

    // transform parent
    box.position.x = 1
    box.rotation.y = Math.PI / 4

    // setting transformation to children
    small1.position.y = 1
    small2.position.y = 1
    small3.position.y = 1

    small1.rotation.x = Math.PI / 2
    small2.rotation.x = Math.PI / 2
    small3.rotation.x = Math.PI / 2

    // setting parent
    small1.parent = box
    small2.setParent(box)
    box.addChild(small3)

    return scene;
  }
}