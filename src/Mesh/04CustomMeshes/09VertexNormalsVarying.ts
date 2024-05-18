import { ArcRotateCamera, DirectionalLight, Engine, LinesMesh, Mesh, MeshBuilder, Scene, Vector3, VertexBuffer, VertexData } from "babylonjs";

export default class VertexNormalsVarying {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Vertex Normals Varying'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, 0, 1), scene);

    const positions = [0, 3, 0, -3, -3, 0, 3, -3, 0]
    const indices = [0, 1, 2]
    const colors = [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]
    let normals = [-1, 0, 0, -1, 0, 0, -1, 0, 0]

    const customMesh = new Mesh('custom')

    const vtData = new VertexData()
    vtData.positions = positions
    vtData.indices = indices
    vtData.colors = colors
    vtData.normals = normals
    vtData.applyToMesh(customMesh, true)

    // show normals for custom mesh
    const lines: LinesMesh[] = []
    for (let i = 0; i < positions.length / 3; i++) {
      const p = i * 3
      const points = [
        new Vector3(positions[p], positions[p+1], positions[p+2]),
        new Vector3(positions[p] + normals[p] * 2, positions[p+1] + normals[p+1] * 2, positions[p+2] + normals[p+2] * 2)
      ]
      lines[i] = MeshBuilder.CreateLines('line' + i, {points, updatable: true})
    }

    function updateNormals() {
      for (let i = 0; i < positions.length / 3; i++) {
        const p = i * 3
        const points = [
          new Vector3(positions[p], positions[p+1], positions[p+2]),
          new Vector3(positions[p] + normals[p] * 2, positions[p+1] + normals[p+1] * 2, positions[p+2] + normals[p+2] * 2)
        ]
        lines[i] = MeshBuilder.CreateLines('line' + i, {points, instance: lines[i]})
      }
    }

    let t = Math.PI
    scene.onBeforeRenderObservable.add(() => {
      t += 0.05
      t = t % (2 * Math.PI)
      normals = []
      // for (let i = 0; i < positions.length / 3; i++) {
      //   normals.push(Math.cos(t), 0, Math.sin(t))
      // }
      normals.push(Math.cos(t), 0, Math.sin(t))
      normals.push(Math.cos(t), Math.sin(t), 0)
      normals.push(0, Math.cos(t), Math.sin(t))
      customMesh.updateVerticesData(VertexBuffer.NormalKind, normals)

      updateNormals()
    })


    return scene;
  }
}