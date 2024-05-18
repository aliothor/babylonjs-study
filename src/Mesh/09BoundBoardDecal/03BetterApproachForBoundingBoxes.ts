import { ArcRotateCamera, BoundingInfo, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class BetterApproachForBoundingBoxes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'A Better Approach For Bounding Boxes'
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
    sphere.showBoundingBox = true

    const parent = new Mesh('parent')
    ground.setParent(parent)
    sphere.setParent(parent)

    const sMin = sphere.getBoundingInfo().boundingBox.minimumWorld
    const sMax = sphere.getBoundingInfo().boundingBox.maximumWorld
    const gMin = ground.getBoundingInfo().boundingBox.minimumWorld
    const gMax = ground.getBoundingInfo().boundingBox.maximumWorld

    const nMin = Vector3.Minimize(sMin, gMin)
    const nMax = Vector3.Maximize(sMax, gMax)

    parent.setBoundingInfo(new BoundingInfo(nMin, nMax))
    parent.showBoundingBox = true

    return scene;
  }
}