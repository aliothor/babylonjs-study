import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, NodeMaterial, NodeMaterialBlock, Nullable, Scene, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Grid, Slider, TextBlock } from "babylonjs-gui";

export default class NinePatchWithNME {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Nine Patch With NME'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const darkColor = Color4.FromInts(30, 30, 30, 255)
    const lightColor = Color4.FromInts(220, 220, 220, 255)

    scene.clearColor = darkColor

    const plane = MeshBuilder.CreatePlane('plane')

    const texs = {
      'ninePath': new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/ninePatch/textures/ninePatchTestTexture.png'),
      'frame': new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/ninePatch/textures/ninePatchFrameShadow.png')
    }

    const meshes = {
      planeWidth: 1.0,
      planeHeight: 1.0
    }

    interface Meshes {
      ninePatch: NodeMaterial,
      ninePatchTex?: Nullable<NodeMaterialBlock>,
      cornerX?: Nullable<NodeMaterialBlock>,
      cornerY?: Nullable<NodeMaterialBlock>
    }

    let mats: Meshes = {
      ninePatch: new NodeMaterial('')
    }

    async function createMaterial() {
      const nodeMat = await NodeMaterial.ParseFromSnippetAsync('#5KRD1G')

      mats.ninePatch = nodeMat
      mats.ninePatchTex = mats.ninePatch.getBlockByName('ninePatchTex')
      mats.cornerX = mats.ninePatch.getBlockByName('cornerX')
      mats.cornerY = mats.ninePatch.getBlockByName('cornerY')

      if (meshes.planeHeight > meshes.planeWidth) {
        mats.cornerX.value = meshes.planeWidth
        mats.cornerY.value = meshes.planeHeight / meshes.planeWidth
      } else {
        mats.cornerY.value = meshes.planeHeight
        mats.cornerX.value = meshes.planeWidth / meshes.planeHeight
      }
      mats.ninePatchTex.texture = texs.ninePath
      plane.material = mats.ninePatch
    }

    const font = 'normal 50px acumin-pro-condensed'
    function createLabel(label: string, row: number, col: number, parent: Grid) {
      const header = new TextBlock(undefined, label)
      header.color = '#ffffff'
      header.fontFamily = font
      header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
      parent.addControl(header, row, col)

      return header
    }

    function createSlider(value: number, max: number, row: number, col: number, parent: Grid) {
      const slider = new Slider()
      slider.isThumbCircle = true
      slider.minimum = 1.0
      slider.maximum = max
      slider.value = value
      slider.height = '20px'
      slider.width = 0.95
      slider.background = '#666666'
      slider.color = '#33aa33'
      parent.addControl(slider, row, col)

      return slider
    }

    function createGUI() {
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('gui', true, scene)

      const layout = new Grid('layout')
      layout.addRowDefinition(0.86)
      layout.addRowDefinition(0.08)
      layout.addRowDefinition(0.06)
      adt.addControl(layout)

      const sliderGrid = new Grid('sliers')
      sliderGrid.addRowDefinition(0.5)
      sliderGrid.addRowDefinition(0.5)
      sliderGrid.addColumnDefinition(0.15)
      sliderGrid.addColumnDefinition(0.85)
      sliderGrid.width = 0.4
      layout.addControl(sliderGrid, 1, 0)

      const widthLabel = createLabel('Width', 0, 0, sliderGrid)
      const widthSlider = createSlider(1.0, 4, 0, 1, sliderGrid)
      widthSlider.onValueChangedObservable.add(function(value) {
        plane.scaling.x = value
        mats.cornerX.value = meshes.planeWidth * value
      })
      const heightLabel = createLabel('Height', 1, 0, sliderGrid)
      const heightSlider = createSlider(1.0, 3, 1, 1, sliderGrid)
      heightSlider.onValueChangedObservable.add(function(value) {
        plane.scaling.y = value
        mats.cornerY.value = meshes.planeHeight * value
      })

      const imageToggle = Button.CreateSimpleButton('toggleImage', 'Frame Image')
      imageToggle.width = '140px'
      imageToggle.height = '30px'
      imageToggle.background = '#666666'
      imageToggle.color = '#fffff'
      imageToggle.thickness = 0
      imageToggle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
      imageToggle.onPointerUpObservable.add(() => {
        if (mats.ninePatchTex.texture.name == texs.ninePath.name) {
          mats.ninePatchTex.texture = texs.frame
          scene.clearColor = lightColor
          widthLabel.color = '#000000'
          heightLabel.color = '#000000'
          imageToggle.textBlock.text = 'Test Image'
        } else {
          mats.ninePatchTex.texture = texs.ninePath
          scene.clearColor = darkColor
          widthLabel.color = '#ffffff'
          heightLabel.color = '#ffffff'
          imageToggle.textBlock.text = 'Frame Image'
        }
      })
      layout.addControl(imageToggle, 2, 0)
    }

    setTimeout(async () => {
      await createMaterial()
    });
    createGUI()
    
    return scene;
  }
}