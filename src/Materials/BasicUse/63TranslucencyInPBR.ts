import { Color3, Color4, CubeTexture, Engine, MeshBuilder, PBRMaterial, Scene } from "babylonjs";
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from "babylonjs-gui";

export default class TranslucencyInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Translucency In PBR'
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
    pbr.subSurface.isTranslucencyEnabled = true

    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture)

    scene.debugLayer.show({showExplorer: false})
    setTimeout(() => {
      scene.debugLayer.select(pbr, 'SUBSURFACE')
    }, 500);

    return scene;
  }
}