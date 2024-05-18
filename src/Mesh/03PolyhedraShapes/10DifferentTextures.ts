import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector2, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class DifferentTextures {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Textures'
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
    light.intensity = 0.6
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene);
    light1.intensity = 0.6

    let m = 7
    let n = 3
    const radius = 1 / 8

    function makeGoldberg(m: number, n: number) {
      const goldberg = MeshBuilder.CreateGoldberg('goldberg', { m, n })
      let center = new Vector2(3 / 8, 1 / 8)
      const uvSet = []
      uvSet.push([0, goldberg.goldbergData.nbSharedFaces + goldberg.goldbergData.nbUnsharedFaces - 1, center.clone(), radius, 0])

      for (let k = 0; k < 12; k++) {
        const row = 3 - Math.floor(k / 4)
        const col = k % 4
        center.x = (2 * col + 1) / 8
        center.y = (2 * row + 1) / 8
        uvSet.push([k, k, center.clone(), radius, 0])
        uvSet.push([goldberg.relatedGoldbergFace(k, 0), goldberg.relatedGoldbergFace(k, goldberg.goldbergData.nbFacesAtPole), center.clone(), radius, 0])
      }
      center.x = 1 / 8
      center.y = 1 / 8
      uvSet.push([goldberg.relatedGoldbergFace(0), goldberg.relatedGoldbergFace(goldberg.goldbergData.nbSharedFaces), center.clone(), radius, 0])

      goldberg.setGoldbergFaceUVs(uvSet)

      const mat = new StandardMaterial('mat')
      mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/hexworld.jpg')
      goldberg.material = mat

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