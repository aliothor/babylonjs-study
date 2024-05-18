import { Color3, Color4, CubeTexture, Engine, MeshBuilder, PBRMaterial, Scene } from "babylonjs";
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from "babylonjs-gui";

export default class ControllingRefractionInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Controlling Refraction In PBR'
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

    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture)

    // scene.debugLayer.show({showExplorer: false})
    // setTimeout(() => {
    //   scene.debugLayer.select(pbr, 'SUBSURFACE')
    // }, 500);

    pbr.subSurface.indexOfRefraction = 1.8
    let a = 0
    scene.afterRender = () => {
      a += 0.01
      pbr.subSurface.indexOfRefraction = 1.5 + Math.cos(a) * 0.5
      txt.text = pbr.subSurface.indexOfRefraction.toFixed(2)
    }
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const panel = new StackPanel()
    panel.width = '100px'
    panel.height = '50px'
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    adt.addControl(panel)
    const txt = new TextBlock()
    txt.color = 'white'
    txt.fontSize = 36
    panel.addControl(txt)

    return scene;
  }
}