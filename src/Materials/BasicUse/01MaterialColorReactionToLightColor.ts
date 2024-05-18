import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, SpotLight, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, RadioGroup, SelectionPanel } from "babylonjs-gui";

export default class MaterialColorReactionToLightColor {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Diffuse Color'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // light mesh
    const redMat = new StandardMaterial('redMat')
    redMat.emissiveColor = new Color3(1, 0, 0)
   
    const greenMat = new StandardMaterial('greenMat')
    greenMat.emissiveColor = new Color3(0, 1, 0)

    const blueMat = new StandardMaterial('blueMat')
    blueMat.emissiveColor = new Color3(0, 0, 1)

    const whiteMat = new StandardMaterial('whiteMat')
    whiteMat.emissiveColor = new Color3(1, 1, 1)

    // red light
    const lightRed = new SpotLight('lightRed', new Vector3(-0.9, 1, -1.8), new Vector3(0, -1, 0), Math.PI / 2, 1.5, scene)
    lightRed.diffuse = new Color3(1, 0, 0)
    lightRed.specular = new Color3(0, 0, 0)

    // green light
    const lightGreen = new SpotLight('lightGreen', new Vector3(0, 1, -0.5), new Vector3(0, -1, 0), Math.PI / 2, 1.5, scene)
    lightGreen.diffuse = new Color3(0, 1, 0)
    lightGreen.specular = new Color3(0, 0, 0)

    // blue light
    const lightBlue = new SpotLight('lightBlue', new Vector3(0.9, 1, -1.8), new Vector3(0, -1, 0), Math.PI / 2, 1.5, scene)
    lightBlue.diffuse = new Color3(0, 0, 1)
    lightBlue.specular = new Color3(0, 0, 0)

    // white light
    const lightWhite = new SpotLight('lightWhite', new Vector3(0, 1, 1), new Vector3(0, -1, 0), Math.PI / 2, 1.5, scene)
    lightWhite.diffuse = new Color3(1, 1, 1)
    lightWhite.specular = new Color3(0, 0, 0)

    // light mesh
    const redSphere = MeshBuilder.CreateSphere('redSphere', {diameter: 0.25})
    redSphere.material = redMat
    redSphere.position = lightRed.position

    const greenSphere = MeshBuilder.CreateSphere('greenSphere', {diameter: 0.25})
    greenSphere.material = greenMat
    greenSphere.position = lightGreen.position

    const blueSphere = MeshBuilder.CreateSphere('blueSphere', {diameter: 0.25})
    blueSphere.material = blueMat
    blueSphere.position = lightBlue.position

    const whiteSphere = MeshBuilder.CreateSphere('whiteSphere', {diameter: 0.25})
    whiteSphere.material = whiteMat
    whiteSphere.position = lightWhite.position

    // ground
    const mats = [
      new Color3(1, 1, 0),
      new Color3(1, 0, 1),
      new Color3(0, 1, 1),
      new Color3(1, 1, 1)
    ]

    const groundMat = new StandardMaterial('groundMat')
    groundMat.diffuseColor = mats[0]

    const ground = MeshBuilder.CreateGround('ground', {width: 4, height: 6})
    ground.material = groundMat
    
    // gui
    const makeYellow = function() {
      groundMat.diffuseColor = mats[0]
    }
    const makePurple = function() {
      groundMat.diffuseColor = mats[1]
    }
    const makeCyan = function() {
      groundMat.diffuseColor = mats[2]
    }
    const makeWhite = function() {
      groundMat.diffuseColor = mats[3]
    }

    const matGroup = new RadioGroup('Material Color')
    matGroup.addRadio('Yellow', makeYellow, true)
    matGroup.addRadio('Purple', makePurple, false)
    matGroup.addRadio('Cyan', makeCyan, false)
    matGroup.addRadio('White', makeWhite, false)

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')

    const selectBox = new SelectionPanel('sp', [matGroup])
    selectBox.width = 0.25
    selectBox.height = '50%'
    selectBox.top = '4px'
    selectBox.left = '4px'
    selectBox.background = 'white'
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    selectBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP

    adt.addControl(selectBox)

    return scene;
  }
}