import { ArcRotateCamera, CreateGreasedLine, CubeTexture, Engine, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, GreasedLineTools, MeshBuilder, PBRMaterial, Scene, Vector3 } from "babylonjs";

export default class SphereMeshPBRMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sphere Mesh PBR Material'
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

    scene.createDefaultSkybox(CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene))

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2})
    sphere.setEnabled(false)

    const line = CreateGreasedLine('line', {
      points: GreasedLineTools.MeshesToLines([sphere])
    }, {
      materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
      width: 0.05
    })

    const pbr = line.material as PBRMaterial
    pbr.metallic = 0
    pbr.roughness = 0
    pbr.subSurface.isRefractionEnabled = true
    pbr.subSurface.indexOfRefraction = 1.8

    return scene;
  }
}