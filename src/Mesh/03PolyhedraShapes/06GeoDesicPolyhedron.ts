import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class GeoDesicPolyhedron {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GeoDesic Polyhedron'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    let m = 3
    let n = 0
    function makeGeodesic(m: number, n: number) {
      return MeshBuilder.CreateGeodesic('g', { m, n, faceColors: [
        new Color4(1, 0, 0),
        new Color4(0, 1, 0),
        new Color4(0, 0, 1),
        new Color4(1, 1, 0),
        new Color4(1, 0, 1),
        new Color4(0, 1, 1),
      ] })
    }

    let g = makeGeodesic(m, n)

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const selectBox = new SelectionPanel('sp')
    selectBox.width = 0.25
    selectBox.height = 0.35
    selectBox.color = 'white'
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    selectBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    adt.addControl(selectBox)

    function displayValue(value: number) {
      if (value > m) n = m
      return n
    }

    function setM(value: number) {
      g.dispose()
      m = Math.floor(value)
      g = makeGeodesic(m, n)
    }

    function setN(value: number) {
      g.dispose()
      n = Math.floor(value)
      if (n > m)  n = m
      g = makeGeodesic(m, n)
    }

    const mnGroup = new SliderGroup('Set')
    mnGroup.groupPanel.color = 'white'
    mnGroup.addSlider('m', setM, '', 1, 20, m)
    mnGroup.addSlider('n', setN, '', 0, 21, n, displayValue)
    selectBox.addGroup(mnGroup)

    return scene;
  }
}