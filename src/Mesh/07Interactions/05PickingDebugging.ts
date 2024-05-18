import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Ray, RayHelper, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class PickingDebugging {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Picking and Debugging'
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

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})
    ground.position.y = -0.1
    const gMat = new StandardMaterial('gMat')
    gMat.alpha = 0.2
    ground.material = gMat

    const box = MeshBuilder.CreateBox('box', {size: 0.5});
    box.position.x = 2
    box.position.y = 1

    const boxTarget = MeshBuilder.CreateBox('boxTarget')
    boxTarget.position.x = 2
    boxTarget.position.z = 2
    boxTarget.scaling.scaleInPlace(0.5)

    box.lookAt(boxTarget.position)

    box.showBoundingBox = true
    boxTarget.showBoundingBox = true
    ground.showBoundingBox = true

    const localMeshDirection = new Vector3(0, 0, 1)
    const localMeshOrigin = new Vector3(0, 0, 0.4)
    const length = 3

    const ray = Ray.Zero()
    const rayHelper = new RayHelper(ray)
    rayHelper.attachToMesh(box, localMeshDirection, localMeshOrigin, length)
    rayHelper.show(scene)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.15})
    sphere.setEnabled(false)

    scene.onBeforeRenderObservable.add(() => {
      box.rotation.y += 0.01

      const hitInfo = ray.intersectsMesh(boxTarget)
      if (hitInfo.pickedPoint) {
        sphere.setEnabled(true)
        sphere.position.copyFrom(hitInfo.pickedPoint)
      } else {
        sphere.setEnabled(false)
      }
    })

    return scene;
  }
}