import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class ColorFaces {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Color Faces'
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

    let m = 7
    let n = 6
    function makeGoldberg(m: number, n: number) {
      const goldberg = MeshBuilder.CreateGoldberg('goldberg', { m, n })
      const colset = []
      colset.push([0, 11, Color4.FromInts(247, 150, 70, 1)])
      for (let k = 0; k < 12; k++) {
        colset.push([goldberg.relatedGoldbergFace(k, 0), goldberg.relatedGoldbergFace(k, goldberg.goldbergData.nbFacesAtPole - 1), new Color4(k % 2, Math.floor(k / 2) % 2, Math.floor(k / 4), 1)])
      }

      goldberg.setGoldbergFaceColors(colset)
      return goldberg
    }

    let g = makeGoldberg(m, n)

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
      g = makeGoldberg(m, n)
    }

    function setN(value: number) {
      g.dispose()
      n = Math.floor(value)
      if (n > m)  n = m
      g = makeGoldberg(m, n)
    }

    const mnGroup = new SliderGroup('Set')
    mnGroup.groupPanel.color = 'white'
    mnGroup.addSlider('m', setM, '', 1, 20, m)
    mnGroup.addSlider('n', setN, '', 0, 21, n, displayValue)
    selectBox.addGroup(mnGroup)

    return scene;
  }
}