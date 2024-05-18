import { Color3, Color4, Constants, CubeTexture, Engine, ImageProcessingConfiguration, Matrix, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, Texture } from "babylonjs";
import 'babylonjs-loaders'

export default class UsingMaskInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Mask In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    scene.clearColor = Color4.FromColor3(Color3.Black())
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 128})
    const pbr = new PBRMaterial('pbr')
    sphere.material = pbr

    pbr.metallic = 0
    pbr.roughness = 0
    pbr.subSurface.isRefractionEnabled = true
    pbr.subSurface.indexOfRefraction = 1.5
    pbr.subSurface.tintColor = Color3.Teal()

    pbr.subSurface.isTranslucencyEnabled = true
    pbr.subSurface.translucencyIntensity = 0.8

    const url = 'https://assets.babylonjs.com/meshes/Georgia-Tech-Dragon/'
    pbr.subSurface.thicknessTexture = new Texture(url + 'thicknessMap.png', scene, false, false)
    pbr.subSurface.minimumThickness = 1
    pbr.subSurface.maximumThickness = 10

    pbr.subSurface.useMaskFromThicknessTexture = true

    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture)


    return scene;
  }
}