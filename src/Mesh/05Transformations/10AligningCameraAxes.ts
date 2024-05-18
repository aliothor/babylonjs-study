import { ArcRotateCamera, Axis, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class AligningCameraAxes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Aligning Camera Axes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 50, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.5, 0.5, 0.5)

    const size = 10
    const worldOrigin = Vector3.Zero()
    const xAxis = MeshBuilder.CreateLines('x', {points: [worldOrigin, Axis.X.scale(size)]})
    const yAxis = MeshBuilder.CreateLines('y', {points: [worldOrigin, Axis.Y.scale(size)]})
    const zAxis = MeshBuilder.CreateLines('z', {points: [worldOrigin, Axis.Z.scale(size)]})
    xAxis.color = Color3.Red()
    yAxis.color = Color3.Green()
    zAxis.color = Color3.Blue()

    // ground
    const ground = MeshBuilder.CreateGround('ground', {width: 10, height: 10, subdivisions: 4})
    const gMat = new StandardMaterial('gMat')
    gMat.diffuseColor = new Color3(0.5, 0, 0.5)
    gMat.backFaceCulling = false
    gMat.alpha = 0.5
    ground.material = gMat

    // plane
    const plane = MeshBuilder.CreateGround('plane', {width: 1, height: 2, subdivisions: 2})
    const pMat = new StandardMaterial('pMat')
    pMat.diffuseTexture = new Texture('/Meshes/blueArrow.png')
    pMat.diffuseTexture.hasAlpha = true
    pMat.backFaceCulling = false
    plane.material = pMat

    // sphere
    const sphere1 = MeshBuilder.CreateSphere('sphere1', {diameter: 3, segments: 10})
    const sMat1 = new StandardMaterial('sMat1')
    sMat1.diffuseColor = Color3.Red()
    sphere1.material = sMat1
    sphere1.position = new Vector3(10, 10, 5)

    const sphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 3, segments: 10})
    const sMat2 = new StandardMaterial('sMat2')
    sMat2.diffuseColor = Color3.Green()
    sphere2.material = sMat2
    sphere2.position = new Vector3(-10, -10, -5)

    // axis
    let axis1: Vector3, axis2: Vector3, axis3: Vector3
    axis1 = sphere1.position.subtract(sphere2.position)
    plane.scaling.x = axis1.length()
    scene.onBeforeRenderObservable.add(() => {
      // axis1 = sphere1.position.subtract(sphere2.position)
      axis3 = Vector3.Cross(camera.position, axis1)
      axis2 = Vector3.Cross(axis3, axis1)

      plane.rotation = Vector3.RotationFromAxis(axis1, axis2, axis3)
    })

    return scene;
  }
}