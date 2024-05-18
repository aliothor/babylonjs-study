import { AbstractMesh, ArcRotateCamera, Color3, Color4, CreateGreasedLine, CubeTexture, Engine, FloatArray, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, GreasedLineTools, HemisphericLight, IndicesArray, Mesh, MeshBuilder, PBRMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class SphereMeshLinePredicate {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'PBR Sphere demo with a Mesh to Line Predicate'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(1, 1, 1)
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2})
    sphere.setEnabled(false)

    const predicate = (p1: Vector3, p2: Vector3, p3: Vector3, ix: number, vx: number) => {
      if (vx % 4 === 0) {
        return [p1, p2, p3]
      }
      return undefined
    }
    const points = GreasedLineTools.MeshesToLines([sphere], predicate)

    const lines = CreateGreasedLine('lines', {points}, {
      materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
      width: 0.05
    })

    const pbr = lines.material as PBRMaterial
    pbr.metallic = 0
    pbr.roughness = 0
    pbr.subSurface.isRefractionEnabled = true
    pbr.subSurface.indexOfRefraction = 1.8
    pbr.subSurface.tintColor = Color3.Black()

    return scene;
  }
}