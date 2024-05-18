import { ArcRotateCamera, CSG, CubeTexture, Engine, HemisphericLight, MeshBuilder, Scene, Vector3, VertexBuffer } from "babylonjs";

export default class UsingCSGSubtract {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using CSG Subtract with Vertex Color'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // create environment
    const hdrTexture = CubeTexture.CreateFromPrefilteredData('https://assets.babylonjs.com/environments/environmentSpecular.env', scene)
    scene.createDefaultSkybox(hdrTexture, true)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2})
    sphere.position.y = 1
    sphere.useVertexColors = true
    const sphereColors = []
    for (let i = 0; i < sphere.getTotalVertices(); i++) {
      sphereColors.push(0, 1, 0, 1)
    }
    sphere.setVerticesData(VertexBuffer.ColorKind, sphereColors)

    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position = new Vector3(1, 0, 1)
    box.useVertexColors = true
    const boxColors = []
    for (let i = 0; i < box.getTotalVertices(); i++) {
      boxColors.push(1, 0, 0, 1)
    }
    box.setVerticesData(VertexBuffer.ColorKind, boxColors)

    const sphereCSG = CSG.FromMesh(sphere)
    const boxCSG = CSG.FromMesh(box)
    const booleanCSG = sphereCSG.subtract(boxCSG)
    const newMesh = booleanCSG.toMesh('newMesh')

    sphere.dispose()
    box.dispose()

    return scene;
  }
}