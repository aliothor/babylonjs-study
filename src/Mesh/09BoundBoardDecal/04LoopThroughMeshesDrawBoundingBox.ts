import { ArcRotateCamera, BoundingInfo, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class LoopThroughMeshesDrawBoundingBox {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Loop Through Meshes to Draw Bounding Box'
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
    light.intensity = 0.7

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2});
    sphere.position.y = 1

    const sphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 2});
    sphere2.position = new Vector3(2, 2, 1)

    const sphere3 = MeshBuilder.CreateSphere('sphere3', {diameter: 2});
    sphere3.position = new Vector3(-3, 0, -2)


    const parent = new Mesh('parent')
    ground.setParent(parent)
    sphere.setParent(parent)
    sphere2.setParent(parent)
    sphere3.setParent(parent)

    const children = parent.getChildMeshes()
    let nMin = children[0].getBoundingInfo().boundingBox.minimumWorld
    let nMax = children[0].getBoundingInfo().boundingBox.maximumWorld

    for (let child of children) {
      const sMin = child.getBoundingInfo().boundingBox.minimumWorld
      const sMax = child.getBoundingInfo().boundingBox.maximumWorld

      nMin = Vector3.Minimize(sMin, nMin)
      nMax = Vector3.Maximize(sMax, nMax)
    }

    parent.setBoundingInfo(new BoundingInfo(nMin, nMax))
    parent.showBoundingBox = true

    return scene;
  }
}