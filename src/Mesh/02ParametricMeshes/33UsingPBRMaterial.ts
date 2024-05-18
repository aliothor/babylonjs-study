import { ArcRotateCamera, CreateGreasedLine, CubeTexture, Engine, GreasedLineMeshMaterialType, PBRMaterial, Scene, Texture, Vector3 } from "babylonjs";

export default class UsingPBRMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using PBR Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 18, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.createDefaultSkybox(CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene))

    const points = [
      -6, 0, 0,
      6, 0, 0
    ]
    const line = CreateGreasedLine('line', {points}, {
      width: 5,
      materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
      // colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })
    line.greasedLineMaterial.color = null

    const pbr = line.material as PBRMaterial
    // pbr.metallic = 0
    // pbr.roughness = 0
    // pbr.subSurface.isRefractionEnabled = true
    // pbr.subSurface.indexOfRefraction = 1.8
    pbr.albedoTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    pbr.metallic = 0.8
    pbr.roughness = 0


    return scene;
  }
}