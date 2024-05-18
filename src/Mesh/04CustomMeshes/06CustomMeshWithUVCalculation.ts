import { ArcRotateCamera, Engine, HemisphericLight, Mesh, Scene, StandardMaterial, Texture, Vector3, VertexData } from "babylonjs";

export default class CustomMeshWithUVCalculation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Mesh With UV Calculation'
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

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
    light.intensity = 0.7

    const positions = [
      -4, 0, 4,
      4, 0, 4,
      4, 0, -4,
      -4, 0, -4,
      -3, 0, 1,
      -1, 0, 1,
      -1, 0, -1,
      -3, 0, -1,
      -2.5, 1, 0.5,
      -1.5, 1, 0.5,
      -1.5, 1, -0.5,
      -2.5, 1, -0.5,
      1, 0, 1,
      3, 0, 1,
      3, 0, -1,
      1, 0, -1,
      2, 1.5, 0,
      -3, 0, 4,
      -1, 0, 4,
      1, 0, 4,
      3, 0, 4,
      3, 0, -4,
      1, 0, -4,
      -1, 0, -4,
      -3, 0, -4
    ]

    var indices = [
      9, 8, 10,
      8, 11, 10,
      8, 4, 11,
      11, 4, 7,
      8, 5, 4,
      8, 9, 5,
      9, 10, 5,
      10, 6, 5,
      10, 7, 6,
      10, 11, 7,
      16, 12, 15,
      16, 13, 12,
      16, 14, 13,
      16, 15, 14,
      4, 18, 17,
      4, 5, 18,
      5, 19, 18,
      5, 12, 19,
      5, 6, 15,
      5, 15, 12,
      12, 20, 19,
      12, 13, 20,
      13, 1, 20,
      13, 2, 1,
      13, 14, 2,
      14, 21, 2,
      14, 22, 21,
      14, 15, 22,
      15, 23, 22,
      15, 6, 23,
      6, 24, 23,
      7, 24, 6,
      7, 3, 24,
      7, 0, 3,
      7, 4, 0,
      4, 17, 0
    ]

    const uvs = []
    for (let p = 0; p < positions.length / 3; p++) {
      uvs.push((positions[3 * p] + 4) / 8, (positions[3 * p + 2] + 4) / 8)
    }

    const normals: any[] = []
    VertexData.ComputeNormals(positions, indices, normals)

    const vtData = new VertexData()
    vtData.positions = positions
    vtData.indices = indices
    vtData.normals = normals
    vtData.uvs = uvs

    const customMesh = new Mesh('custom')
    vtData.applyToMesh(customMesh)
    customMesh.convertToFlatShadedMesh()

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/co.png')
    customMesh.material = mat

    return scene;
  }
}