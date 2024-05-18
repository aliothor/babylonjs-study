import { ArcRotateCamera, AxesViewer, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class RemovingParent {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Removing a Parent'
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

    // --------- 属性解除父子关系（全部变换）；方法解除父子关系（影响关系确定后的变换）

    // setting parent
    small1.parent = box
    small2.setParent(box)
    box.addChild(small3)

    // transform parent
    box.position = new Vector3(1, 1, 1)
    box.rotation.y = Math.PI / 2

    // setting transformation to children
    small1.position.y = 1
    small2.position.y = 1
    small3.position.y = 1

    small1.rotation.x = Math.PI / 2
    small2.rotation.x = Math.PI / 2
    small3.rotation.x = Math.PI / 2

    // new transformation
    small1.position = new Vector3(2, 2, 2)
    small2.position = new Vector3(2, 2, 2)
    small3.position = new Vector3(2, 2, 2)

    small1.rotation.y = Math.PI / 2
    small2.rotation.y = Math.PI / 2
    small3.rotation.y = Math.PI / 2

    const wireBox = MeshBuilder.CreateBox('wireBox', {size: 2})
    wireBox.position = new Vector3(2, 2, 0)
    wireBox.material = new StandardMaterial('wireBoxMat')
    wireBox.material.wireframe = true

    // remove parent
    small1.parent = null
    small2.setParent(null)
    box.removeChild(small3)

    return scene;
  }
}