import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Tools, Vector2, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class AnglingTextures {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Angling Textures'
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

    let m = 2
    let n = 1
    const radius = 1 / 2
    let angle = 0

    function makeGoldberg(m: number, n: number) {
      const goldberg = MeshBuilder.CreateGoldberg('goldberg', { m, n })
      let center = new Vector2(1 / 2, 1 / 2)
      const uvSet = []
      uvSet.push([0, goldberg.goldbergData.nbSharedFaces + goldberg.goldbergData.nbUnsharedFaces - 1, center.clone(), radius, angle])

      // pole
      center.x = 1 / 8
      center.y = 1 / 8
      uvSet.push([0, 11, center.clone(), 1 / 8, 0])

      goldberg.setGoldbergFaceUVs(uvSet)

      goldberg.setGoldbergFaceColors([[0, 11, new Color4(0, 0, 1, 1)]])

      const mat = new StandardMaterial('mat')
      mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/redarrow.jpg')
      goldberg.material = mat

      return goldberg
    }

    let g = makeGoldberg(m, n)

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const selectBox = new SelectionPanel('sp')
    selectBox.width = 0.25
    selectBox.height = 0.5
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

    function setAngle(value: number) {
      g.dispose()
      angle = value
      g = makeGoldberg(m, n)
    }

    function displayAngleValue(value: number) {
      return Tools.ToDegrees(value) | 0
    }

    const mnGroup = new SliderGroup('Set')
    mnGroup.groupPanel.color = 'white'
    mnGroup.addSlider('m', setM, '', 1, 20, m)
    mnGroup.addSlider('n', setN, '', 0, 21, n, displayValue)
    mnGroup.addSlider('Angle', setAngle, 'degs', 0, 2 * Math.PI, 0, displayAngleValue)
    selectBox.addGroup(mnGroup)

    return scene;
  }
}