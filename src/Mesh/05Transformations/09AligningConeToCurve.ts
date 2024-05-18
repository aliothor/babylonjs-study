import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, KeyboardEventTypes, LinesMesh, Mesh, MeshBuilder, Path3D, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class AligningConeToCurve {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Aligning a Cone To a Curve'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 350, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

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
    for (let i = 0; i < curve.length; i += 10) {
      MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(normals[i].scale(5))] }).color = Color3.Red()
      MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(binormals[i].scale(5))] }).color = Color3.Green()
      MeshBuilder.CreateLines('', { points: [curve[i], curve[i].add(tangents[i].scale(5))] }).color = Color3.Blue()
    }

    // draw the curves
    const line = MeshBuilder.CreateLines('line0', {points})

    // cone
    const cone = MeshBuilder.CreateCylinder('cone', {diameterTop: 0, diameterBottom: 10, height: 15})

    const localAxes = new AxesViewer(scene, 10)
    localAxes.xAxis.parent = cone
    localAxes.yAxis.parent = cone
    localAxes.zAxis.parent = cone


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

    let loop = true
    scene.onKeyboardObservable.add((evt) => {
      if (evt.type == KeyboardEventTypes.KEYUP) {
        if (evt.event.key == ' ') {
          loop = !loop
        }
        if (evt.event.key.toLowerCase() == 'z') {
          if (!loop) {
            camera.zoomOn([cone])
            camera.minZ = 1
            camera.maxZ = 5000
          } else {
            camera.zoomOn([line])
          }
        }
      }
    })

    let p = 0
    scene.onBeforeRenderObservable.add(() => {
      if (!loop) return
      cone.rotation = orientation(4, p)
      cone.position = curve[p]
      p++
      p %= curve.length
    })

    return scene;
  }
}

