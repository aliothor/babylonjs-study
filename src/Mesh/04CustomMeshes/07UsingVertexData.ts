import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3, VertexBuffer } from "babylonjs";

export default class UsingVertexData {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Vertex Data'
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

    const sphere0 = MeshBuilder.CreateSphere('sphere0', { diameter: 2, segments: 16 })
    sphere0.position.x = -1
    sphere0.position.y = 1

    const sphere1 = MeshBuilder.CreateSphere('sphere1', { diameter: 2, segments: 16 })
    sphere1.position.x = 1
    sphere1.position.y = 1
    sphere1.convertToFlatShadedMesh()

    const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6, subdivisions: 2 })

    // normal
    const pos = sphere1.getVerticesData(VertexBuffer.PositionKind)!
    const normal = sphere1.getVerticesData(VertexBuffer.NormalKind)!
    for (let p = 0; p < pos.length; p += 3) {
      MeshBuilder.CreateLines('lines' + p, {
        points: [
          new Vector3(pos[p], pos[p+1], pos[p+2]),
          new Vector3(pos[p] + normal[p] * 0.3, pos[p+1] + normal[p+1] * 0.3, pos[p+2] + normal[p+2] * 0.3)
        ]
      }).position = sphere1.position
    }

    return scene;
  }
}