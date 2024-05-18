import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexData } from "babylonjs";

export default class BoxNormals {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Box Normals'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const cube1 = {
      "vertex":[[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1],[-1,1,1],[1,1,1],[1,-1,1],[-1,-1,1]],
      "face":[[0,1,2,3],[4,7,6,5],[1,5,6,2],[0,3,7,4],[0,4,5,1],[3,2,6,7]]
    }

    const mat = new StandardMaterial('mat')
    mat.wireframe = true

    function createPolyhedron(data: { vertex: number[][], face: number[][]}, size: number) {
      const positions: number[] = []
      const indices: number[] = []
      const normals: number[] = []
      let uvs: number[] = []
      const faceUVs = [[0, 0], [1, 0], [1, 1], [0, 1]]

      // positions
      for (let i = 0; i < data.vertex.length; i++) {
        positions.push(data.vertex[i][0] * size, data.vertex[i][1] * size, data.vertex[i][2] * size)
      }

      // indices from faces
      for (let f = 0; f < data.face.length; f++) {
        for (let j = 0; j < data.face[f].length; j++) {
          uvs = uvs.concat(faceUVs[j])
        }
        for (let i = 0; i < data.face[f].length - 2; i++) {
          indices.push(data.face[f][0], data.face[f][i + 2], data.face[f][i + 1])
        }
      }

      VertexData.ComputeNormals(positions, indices, normals)
      VertexData._ComputeSides(Mesh.FRONTSIDE, positions, indices, normals, uvs)

      const vtData = new VertexData()
      vtData.positions = positions
      vtData.indices = indices
      vtData.normals = normals
      vtData.uvs = uvs

      const polyhedron = new Mesh('polyhedron')
      vtData.applyToMesh(polyhedron)

      return polyhedron
    }

    // box0
    const box0 = createPolyhedron(cube1, 1)
    box0.position.y = 3
    box0.material = mat

    // show normals for polyhedron
    let pdata = box0.getPositionData()!
    let ndata = box0.getNormalsData()!
    for (let p = 0; p < pdata.length; p += 3) {
      MeshBuilder.CreateLines('lines' + p, {
        points: [
          new Vector3(pdata[p], pdata[p+1], pdata[p+2]),
          new Vector3(pdata[p] + ndata[p], pdata[p+1] + ndata[p+1], pdata[p+2] + ndata[p+2])
        ]
      }).position.y = 3
    }

    // box1
    const box1 = box0.clone('box1')
    box1.position.y = -3
    box1.convertToFlatShadedMesh()

    pdata = box1.getPositionData()!
    ndata = box1.getNormalsData()!
    for (let p = 0; p < pdata.length; p += 3) {
      MeshBuilder.CreateLines('lines' + p, {
        points: [
          new Vector3(pdata[p], pdata[p+1], pdata[p+2]),
          new Vector3(pdata[p] + ndata[p], pdata[p+1] + ndata[p+1], pdata[p+2] + ndata[p+2])
        ]
      }).position.y = -3
    }



    return scene;
  }
}