import { ArcRotateCamera, Color4, Engine, HemisphericLight, Material, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, CheckboxGroup, Control, RadioGroup, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class UsingDetailMaps {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Detail Maps'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(.5, .5, .5, 1)

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.inertia = 0.7

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const light2 = new PointLight('light2', new Vector3(-1, 5, 3), scene)
    const light3 = new PointLight('light3', new Vector3(3, 0, -5), scene)

    // meshes
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 32})
    sphere.position.x = -1
    sphere.position.y = 1
    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position = new Vector3(1.8, 1, -1.5)

    // ground
    const ground = MeshBuilder.CreateGround('box', {width: 6, height: 6})

    // texture
    const url = 'https://playground.babylonjs.com/textures/'
    const diffuseTexture = new Texture(`${url}ParallaxDiffuse.png`)
    const detailTexture = new Texture(`${url}detailmap.png`)
    const bumpTexture = new Texture(`${url}ParallaxNormal.png`)

    // material
    const setDetailTexture = (mat: StandardMaterial | PBRMaterial) => {
      mat.detailMap.isEnabled = true
      mat.detailMap.texture = detailTexture
      mat.detailMap.texture.uScale = mat.saveUVScale || 10
      mat.detailMap.texture.vScale = mat.saveUVScale || 10
    }

    const matStd = new StandardMaterial('matStd')
    matStd.diffuseTexture = diffuseTexture
    matStd.detailMap.isEnabled = true
    matStd.detailMap.diffuseBlendLevel = 0.1
    matStd.detailMap.bumpLevel = 1
    matStd.bumpTexture = bumpTexture
    matStd.bumpTexture.level = 1
    matStd.detailMap.roughnessBlendLevel = 0.25

    setDetailTexture(matStd)

    const matPBR = new PBRMaterial('matPBR')
    matPBR.metallic = 1
    matPBR.roughness = 0.5
    matPBR.albedoTexture = diffuseTexture
    matPBR.detailMap.diffuseBlendLevel = 0.1
    matPBR.detailMap.bumpLevel = 1
    matPBR.bumpTexture = bumpTexture
    matPBR.bumpTexture.level = 0.34
    matPBR.detailMap.roughnessBlendLevel = 0.25

    setDetailTexture(matPBR)

    let usePBR = false
    let mat: StandardMaterial | PBRMaterial

    // set material
    const setMaterial = () => {
      const matDst = usePBR ? matPBR : matStd
      const matSrc = usePBR ? matStd : matPBR

      matDst.detailMap.texture = matSrc.detailMap.texture
      matDst.bumpTexture = matSrc.bumpTexture
      matDst.detailMap.normalBlendMethod = matSrc.detailMap.normalBlendMethod
      matDst.detailMap.diffuseBlendLevel = matSrc.detailMap.diffuseBlendLevel
      matDst.detailMap.bumpLevel = matSrc.detailMap.bumpLevel
      matDst.detailMap.isEnabled = matSrc.detailMap.isEnabled
      matDst.saveUVScale = matSrc.saveUVScale

      ground.material = matDst
      sphere.material = matDst
      box.material = matDst

      const pbrMult = usePBR ? 6 : 1

      light.intensity = usePBR ? 1 : 0.2
      light2.intensity = usePBR ? 20 : 0.6
      light3.intensity = usePBR ? 20 : 0.6

      mat = usePBR ? matPBR : matStd
    }

    setMaterial()

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const selectBox = new SelectionPanel('sp')

    selectBox.width = 0.25
    selectBox.height = 0.5
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    selectBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    selectBox.color = 'white'
    selectBox.headerColor = 'white'
    adt.addControl(selectBox)

    const activationGroup = new CheckboxGroup('activation')

    const setActivationBumpMapping = (c: boolean) => {
      if (c) mat.bumpTexture = bumpTexture
      else mat.bumpTexture = null
    }
    const setActivationDetailMapping = (c: boolean) => {
      setDetailTexture(mat)
      mat.detailMap.isEnabled = c
    }
    const setActivationPBR = (c: boolean) => {
      usePBR = c
      setMaterial()
    }

    activationGroup.addCheckbox('Bump mapping', setActivationBumpMapping, mat.bumpTexture != null)
    activationGroup.addCheckbox('Detail mapping', setActivationDetailMapping, mat.detailMap.isEnabled != null)
    activationGroup.addCheckbox('PBR material', setActivationPBR, usePBR)

    selectBox.addGroup(activationGroup)

    const normalBlendMethodGroup = new RadioGroup('Normal blend method')

    const setNormalBlendMethod = (b: number) => {
      mat.detailMap.normalBlendMethod = b
    }

    normalBlendMethodGroup.addRadio('whiteout', setNormalBlendMethod, mat.detailMap.normalBlendMethod == Material.MATERIAL_NORMALBLENDMETHOD_WHITEOUT)
    normalBlendMethodGroup.addRadio('Rotated Normal Mapping', setNormalBlendMethod, mat.detailMap.normalBlendMethod == Material.MATERIAL_NORMALBLENDMETHOD_RNM)

    selectBox.addGroup(normalBlendMethodGroup)

    // box 2
    const selectBox2 = new SelectionPanel('sp2')
    selectBox2.width = 0.3
    selectBox2.height = 0.5
    selectBox2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    selectBox2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    selectBox2.color = 'white'
    selectBox2.headerColor = 'white'
    adt.addControl(selectBox2)

    const sliderGroup = new SliderGroup('Detail sliders')

    sliderGroup.addSlider('uvScale', v => mat.detailMap && (mat.detailMap.texture.uScale = v, mat.detailMap.texture.vScale = v, mat.saveUVScale = v), '', 1, 20, mat.detailMap.texture.uScale, v => parseFloat(v.toFixed(2)))
    sliderGroup.addSlider('diffuse blending', v => mat.detailMap.diffuseBlendLevel = v, '', 0, 1, mat.detailMap.diffuseBlendLevel, v => parseFloat(v.toFixed(2)))
    sliderGroup.addSlider('roughness blending (PBR)', v => mat.detailMap.roughnessBlendLevel = v, '', 0, 1, mat.detailMap.roughnessBlendLevel, v => parseFloat(v.toFixed(2)))

    selectBox2.addGroup(sliderGroup)

    let t = 0
    scene.onBeforeRenderObservable.add(() => {
      sphere.rotation.y = t * 0.5
      box.rotation.y = t * 0.5
      t += 0.01
    })

    return scene;
  }
}