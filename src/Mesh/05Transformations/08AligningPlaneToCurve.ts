import { ArcRotateCamera, Color3, Engine, HemisphericLight, LinesMesh, Mesh, MeshBuilder, Path3D, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class AligningPlaneToCurve {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Aligning a Plane To a Curve'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 1200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.wheelPrecision = 0.1
    camera.panningSensibility = 2

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // create array of points to describe the curve
    const points: Vector3[] = []
    for (let i = 0; i < 500; i++) {
      points.push(new Vector3(i - 250, 50 * Math.sin(i / 20), i / 10 * Math.cos(i / 20)))
    }

    // create path3d from array of points
    const path3d = new Path3D(points)
    const curve = path3d.getCurve()
    const tangents = path3d.getTangents()
    const normals = path3d.getNormals()
    const binormals = path3d.getBinormals()

    // draw axies
    // for (let i = 0; i < curve.length; i += 5) {
    //   MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(normals[i].scale(30))] }).color = Color3.Red()
    //   MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(binormals[i].scale(30))] }).color = Color3.Green()
    //   MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(tangents[i].scale(30))] }).color = Color3.Blue()
    // }

    // draw the curves
    
    const lines: LinesMesh[] = []
    lines[0] = MeshBuilder.CreateLines('line0', {points})
    lines[0].position.y = 400
    for (let i = 1; i < 6; i++) {
      lines[i] = lines[0].clone('line' + i)
      lines[i].position.y = 400 - i * 150
    }

    // normal
    const norm = new Vector3(0, 0, 1)
    const posOfNorm = new Vector3(0, 0, 0)

    // create planes in xy plane to trace the curves
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/alphabet.jpeg')

    const planes: Mesh[] = []
    planes[0] = MeshBuilder.CreatePlane('plane0', {size: 60, sideOrientation: Mesh.DOUBLESIDE, frontUVs: new Vector4(0, 0, 1 / 6, 1), backUVs: new Vector4(1 / 6, 0, 2 / 6, 1)})
    planes[0].material = mat
    for (let i = 1; i < 6; i++) {
      planes[i] = planes[0].clone('plane' + i)
    }

    // draw the normal lines in red
    const normalLines: LinesMesh[] = []
    normalLines[0] = MeshBuilder.CreateLines('normalLine0', {
      points: [
        posOfNorm.subtract(norm).scale(30),
        posOfNorm.add(norm).scale(30)
      ]
    })
    normalLines[0].color = Color3.Red()
    normalLines[0].parent = planes[0]
    for (let i = 1; i < 6; i++) {
      normalLines[i] = normalLines[0].clone('normalLine' + i)
      normalLines[i].parent = planes[i]
    }

    function orientation(i: number, p: number) {
      switch (i) {
        case 0:
          return Vector3.RotationFromAxis(tangents[p], binormals[p], normals[p])
        case 1:
          return Vector3.RotationFromAxis(tangents[p], normals[p], binormals[p])
        case 2:
          return Vector3.RotationFromAxis(normals[p], tangents[p], binormals[p])
        case 3:
          return Vector3.RotationFromAxis(normals[p], binormals[p], tangents[p])
        case 4:
          return Vector3.RotationFromAxis(binormals[p], tangents[p], normals[p]) 
        case 5:
          return Vector3.RotationFromAxis(binormals[p], normals[p], tangents[p])
      }
      return Vector3.Zero()
    }

    let p = 0
    scene.onBeforeRenderObservable.add(() => {
      for (let i = 0; i < 6; i++) {
        planes[i].rotation = orientation(i, p)
        planes[i].position = points[p].add(new Vector3(0, 400 - i * 150, 0))
      }
      p++
      p %= curve.length
    })

    return scene;
  }
}