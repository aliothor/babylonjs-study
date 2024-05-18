import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class ExtrudingIrregularPolygonsAdvanced {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extruding Irregular Polygons Advanced'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.6
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene);
    light.intensity = 0.6

    // polygon shape profile
    const numberOfSides = 5
    const radius = 1
    const stepAngle = 2 * Math.PI / numberOfSides
    const points: Vector3[] = []
    for (let sides = 0; sides < numberOfSides; sides++) {
      points.push(new Vector3(radius * Math.cos(sides * stepAngle), 0, radius * Math.sin(sides * stepAngle)))
    }

    MeshBuilder.CreateLines('shape', { points }).color = Color3.Magenta()

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/spriteAtlas.png')

    const faceUV: Vector4[] = []
    faceUV[0] = new Vector4(1 / 6, 0, 2 / 6, 1 / 4)
    faceUV[1] = new Vector4(1 / 6, 0, 1, 1 / 4)
    faceUV[2] = new Vector4(4 / 6, 0, 1, 1)

    const polygon1 = MeshBuilder.ExtrudePolygon('polygon1', {
      shape: points,
      depth: 0.4,
      faceUV
    })
    polygon1.material = mat
    polygon1.position.y = 1

    const polygon2 = MeshBuilder.ExtrudePolygon('polygon2', {
      shape: points,
      depth: 0.4,
      faceUV,
      wrap: true
    })
    polygon2.material = mat

    return scene;
  }
}