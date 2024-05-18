import { Color3, Color4, Constants, CubeTexture, Engine, ImageProcessingConfiguration, Matrix, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, Texture } from "babylonjs";
import 'babylonjs-loaders'

export default class ClearCoatBumpMapInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Clear Coat and Bump Map In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const url = 'https://playground.babylonjs.com/textures/'
    scene.clearColor = Color4.FromColor3(Color3.Black())
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(url + 'environment.dds', scene)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 128})
    const pbr = new PBRMaterial('pbr')
    sphere.material = pbr

    pbr.metallic = 0
    pbr.roughness = 1

    pbr.clearCoat.isEnabled = true

    pbr.forceIrradianceInFragment = true
    pbr.bumpTexture = new Texture(url + 'floor_bump.png')
    pbr.clearCoat.bumpTexture = new Texture(url + 'waterbump.png')

    pbr.clearCoat.isTintEnabled = true
    pbr.clearCoat.tintColor = Color3.Teal()
    pbr.clearCoat.tintColorAtDistance = 1
    pbr.clearCoat.tintThickness = 1.5

    scene.debugLayer.show({showExplorer: false})
    pbr.onBindObservable.add(function() {
      scene.debugLayer.select(pbr, 'CLEAR COAT')
    })

    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture)


    return scene;
  }
}