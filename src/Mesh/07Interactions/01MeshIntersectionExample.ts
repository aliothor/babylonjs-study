import { ArcRotateCamera, Color3, Engine, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MeshIntersectionExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Mesh Intersection Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.5, 70, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // material
    const planeMat = new StandardMaterial('planeMat')
    planeMat.backFaceCulling = false
    planeMat.emissiveColor = new Color3(0.2, 1, 0.2)

    const boxMat = new StandardMaterial('boxMat')
    boxMat.emissiveColor = new Color3(1, 1, 1)
    boxMat.wireframe = true

    // two planes
    const plane1 = MeshBuilder.CreatePlane('plane1', {size: 20})
    plane1.position = new Vector3(-13, 0, 0)
    plane1.rotation.x = Math.PI / 4
    plane1.material = planeMat

    const plane2 = MeshBuilder.CreatePlane('plane2', {size: 20})
    plane2.position = new Vector3(13, 0, 0)
    plane2.rotation.x = Math.PI / 4
    plane2.material = planeMat

    // bounding box
    const box1 = MeshBuilder.CreateBox('box1', {size: 20})
    box1.parent = plane1
    box1.scaling = new Vector3(1, 1, 0.05)
    box1.material = boxMat

    const box2 = MeshBuilder.CreateBox('box2', {size: 20})
    box2.position = plane2.position
    box2.scaling = new Vector3(1, 0.7, 0.7)
    box2.material = boxMat

    // inerscetion point
    const intersectPoint = new Vector3(30, 0, 0)
    const origin = MeshBuilder.CreateSphere('origin', {diameter: 0.3, segments: 4})
    origin.position = intersectPoint
    origin.material = planeMat

    // balloons
    const balloon1 = MeshBuilder.CreateSphere('balloon1', {diameter: 2, segments: 10})
    const balloon2 = MeshBuilder.CreateSphere('balloon2', {diameter: 2, segments: 10})
    const balloon3 = MeshBuilder.CreateSphere('balloon3', {diameter: 2, segments: 10})
    balloon1.position = new Vector3(-6, 5, 0)
    balloon2.position = new Vector3(6, 5, 0)
    balloon3.position = new Vector3(30, 5, 0)
    balloon1.material = new StandardMaterial('balloon1Mat')
    balloon2.material = new StandardMaterial('balloon2Mat')
    balloon3.material = new StandardMaterial('balloon3Mat')

    // animation
    let alpha = 0
    scene.onBeforeRenderObservable.add(() => {
      if (balloon1.intersectsMesh(plane1, true)) {
        (balloon1.material as StandardMaterial).emissiveColor = Color3.Red()
      } else {
        (balloon1.material as StandardMaterial).emissiveColor = Color3.White()
      }

      if (balloon2.intersectsMesh(plane2, false)) {
        (balloon2.material as StandardMaterial).emissiveColor = Color3.Red()
      } else {
        (balloon2.material as StandardMaterial).emissiveColor = Color3.White()
      }
      if (balloon3.intersectsPoint(intersectPoint)) {
        (balloon3.material as StandardMaterial).emissiveColor = Color3.Red()
      } else {
        (balloon3.material as StandardMaterial).emissiveColor = Color3.White()
      }

      alpha += 0.01
      balloon1.position.y += Math.cos(alpha) / 10
      balloon2.position.y = balloon1.position.y
      balloon3.position.y = balloon1.position.y
    })


    return scene;
  }
}