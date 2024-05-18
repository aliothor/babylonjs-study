import { Color3, Color4, CubeTexture, Engine, MeshBuilder, PBRMaterial, Scene } from "babylonjs";
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from "babylonjs-gui";

export default class ColorControllInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Color Controll In PBR'
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
    let a = 0
    scene.afterRender = () => {
      a += 0.01
      pbr.subSurface.tintColor.g = 0.5 + Math.cos(a) * 0.5
      pbr.subSurface.tintColor.b = pbr.subSurface.tintColor.g
    }

    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture)

    return scene;
  }
}