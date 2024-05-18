import { ArcRotateCamera, Color3, Debug, DirectionalLight, DynamicTexture, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer, VertexData } from "babylonjs";

export default class CustomMeshWithBothFacets {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Mesh With Both Facets'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, 0, 1), scene);

    const customMesh = new Mesh('custom')
    const positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3]
    const indices = [0, 1, 2, 3, 4, 5]
    const normals: never[] = []
    VertexData.ComputeNormals(positions, indices, normals)

    const vertexData = new VertexData()
    vertexData.positions = positions
    vertexData.indices = indices
    vertexData.normals = normals
    vertexData.applyToMesh(customMesh)

    const mat = new StandardMaterial('mat')
    mat.backFaceCulling = false
    customMesh.material = mat

    new Debug.AxesViewer(scene, 5)

    function makeTextPlane(text: string, color: string, size: number) {
      const dynTex = new DynamicTexture('dynTex', 50, scene, true)
      dynTex.hasAlpha = true
      dynTex.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true)
      const plane = MeshBuilder.CreatePlane('plane', { size, updatable: true })
      const pMat = new StandardMaterial('pMat')
      pMat.backFaceCulling = false
      pMat.specularColor = new Color3(0, 0, 0)
      pMat.diffuseTexture = dynTex
      plane.material = pMat

      return plane
    }

    // label vertices with indices
    const pt0 = makeTextPlane('0', 'black', 1.5)
    pt0.position = new Vector3(-5, 2, -3)
    const pt1 = makeTextPlane('1', 'black', 1.5)
    pt1.position = new Vector3(-7, -2, -3)
    const pt2 = makeTextPlane('2', 'black', 1.5)
    pt2.position = new Vector3(-3, -2, -3)
    const pt3 = makeTextPlane('3', 'black', 1.5)
    pt3.position = new Vector3(5, 2, 3)
    const pt4 = makeTextPlane('4', 'black', 1.5)
    pt4.position = new Vector3(7, -2, 3)
    const pt5 = makeTextPlane('5', 'black', 1.5)
    pt5.position = new Vector3(3, -2, 3)

    // show normal for custom mesh
    const pdata = customMesh.getVerticesData(VertexBuffer.PositionKind)!
    const ndata = customMesh.getVerticesData(VertexBuffer.NormalKind)!

    for (let p = 0; p < pdata.length; p += 3) {
      MeshBuilder.CreateLines('lines' + p, {
        points: [
          new Vector3(pdata[p], pdata[p+1], pdata[p+2]),
          new Vector3(pdata[p] + ndata[p] * 2, pdata[p+1] + ndata[p+1] * 2, pdata[p+2] + ndata[p+2] * 2),
          new Vector3(pdata[p] + ndata[p] * 2, pdata[p+1] + 0.5, pdata[p+2] + ndata[p+2] * 1.5),
          new Vector3(pdata[p] + ndata[p] * 2, pdata[p+1] - 0.5, pdata[p+2] + ndata[p+2] * 1.5),
          new Vector3(pdata[p] + ndata[p] * 2, pdata[p+1] + ndata[p+1] * 2, pdata[p+2] + ndata[p+2] * 2)
        ]
      })
    }

    return scene;
  }
}