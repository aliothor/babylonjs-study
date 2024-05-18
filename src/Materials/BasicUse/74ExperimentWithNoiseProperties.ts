import { Engine, MeshBuilder, NoiseProceduralTexture, Scene, StandardMaterial } from "babylonjs";
import { AdvancedDynamicTexture, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";

export default class ExperimentWithNoiseProperties {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Experiment With Noise Properties'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const plane = MeshBuilder.CreatePlane('plane', {size: 10})
    const mat = new StandardMaterial('mat')
    plane.material = mat

    mat.disableLighting = true
    mat.backFaceCulling = false

    const noiseTex = new NoiseProceduralTexture('tex', 256)
    mat.emissiveTexture = noiseTex

    scene.createDefaultCameraOrLight(true, true, true)

    // UI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const panel = new StackPanel()
    panel.width = '220px'
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    adt.addControl(panel)

    const addSlider = function(title: string, value: number, min: number, max: number, onChange: (value: number) => void, isInteger?: boolean) {
      const header = new TextBlock()
      header.text = title + ': ' + (isInteger ? value | 0 : value.toFixed(2))
      header.height = '30px'
      header.color = 'white'
      panel.addControl(header)

      const slider = new Slider()
      slider.minimum = min
      slider.maximum = max
      slider.value = value
      slider.height = '20px'
      slider.width = '200px'
      slider.onValueChangedObservable.add(function(v) {
        header.text = title + ': ' + (isInteger ? v | 0 : v.toFixed(2))
        onChange(v)
      })
      panel.addControl(slider)
    }

    addSlider('octaves', noiseTex.octaves, 0, 8, (v) => {
      noiseTex.octaves = v
    }, true)
    addSlider('persistence', noiseTex.persistence, 0, 2, (v) => {
      noiseTex.persistence = v
    })
    addSlider('speedX', noiseTex.animationSpeedFactor, -20, 20, (v) => {
      noiseTex.animationSpeedFactor = v
    })

    return scene;
  }
}