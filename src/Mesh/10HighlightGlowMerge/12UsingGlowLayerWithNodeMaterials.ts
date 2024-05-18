import { Animation, ArcRotateCamera, Color3, EasingFunction, Engine, GlowLayer, InputBlock, NodeMaterial, Nullable, Scene, SceneLoader, SineEase, Texture, TextureBlock } from "babylonjs";
import 'babylonjs-loaders'

export default class UsingGlowLayerWithNodeMaterials {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Glow Layer with Node Materials'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    scene.createDefaultCamera(true)

    const promises = []
    promises.push(SceneLoader.AppendAsync('https://models.babylonjs.com/Demos/nmeGlow/lightFixture.glb'))
    promises.push(NodeMaterial.ParseFromFileAsync('lightNodeMat', 'https://models.babylonjs.com/Demos/nmeGlow/lightGlowMat.json', scene))

    Promise.all(promises).then((results) => {
      scene.createDefaultCameraOrLight(true, true, true)
      const camera = scene.getCameraById('default camera') as ArcRotateCamera
      camera.beta = 1.4
      camera.alpha = 1.2

      const helper = scene.createDefaultEnvironment()
      helper?.setMainColor(Color3.Gray())

      // get light mesh, material and texture
      const lightMesh = scene.getMeshByName('lightTube')!
      const loadedTextures = lightMesh.material?.getActiveTextures()!
      let lightBaseColorTex: Nullable<Texture> = null
      let ligthEmissiveTex: Nullable<Texture> = null
      for (let i = 0; i < loadedTextures.length; i++) {
        if (loadedTextures[i].name.includes('(Base Color)')) {
          lightBaseColorTex = loadedTextures[i] as Texture
        } else if (loadedTextures[i].name.includes('(Emissive)')) {
          ligthEmissiveTex = loadedTextures[i] as Texture
        }
      }

      // build node material
      const lightNodeMat = results[1] as NodeMaterial
      lightNodeMat.build(false)
      lightMesh.material = lightNodeMat

      // assign original textues to node material
      const baseColor = lightNodeMat.getBlockByName('baseColorTexture') as TextureBlock
      const emissiveColor = lightNodeMat.getBlockByName('emissiveTexture') as TextureBlock
      baseColor.texture = lightBaseColorTex
      emissiveColor.texture = ligthEmissiveTex

      // glow mask
      const glowMask = lightNodeMat.getBlockByName('glowMask') as InputBlock
      const emissiveStrength = lightNodeMat.getBlockByName('emissiveStrength')

      // glow layer
      const gl = new GlowLayer('gl')
      gl.intensity = 1.25
      gl.referenceMeshToUseItsOwnMaterial(lightMesh)
      gl.onBeforeRenderMeshToEffect.add(() => {
        glowMask.value = 1
      })
      gl.onAfterRenderMeshToEffect.add(() => {
        glowMask.value = 0
      })

      // flicker animation
      const flickerAnim = new Animation('flickerAnim', 'value', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
      const easingFun = new SineEase()
      easingFun.setEasingMode(EasingFunction.EASINGMODE_EASEOUT)
      const flickerKeys = [
        { frame: 0, value: 0.2 },
        { frame: 5, value: 0.8 },
        { frame: 10, value: 0.1 },
        { frame: 25, value: 0.8 },
        { frame: 30, value: 0.05 },
        { frame: 35, value: 0.7 },
        { frame: 40, value: 0.3 },
        { frame: 55, value: 0.5 },
        { frame: 70, value: 0.35 },
        { frame: 170, value: 1.0 },
      ]
      flickerAnim.setKeys(flickerKeys)
      flickerAnim.setEasingFunction(easingFun)
      scene.beginDirectAnimation(emissiveStrength, [flickerAnim], 0, flickerKeys[flickerKeys.length - 1].frame, true, 1)

      // show inspector
      scene.debugLayer.show({embedMode: true}).then(() => [
        scene.debugLayer.select(lightNodeMat)
      ])

    })

    return scene;
  }
}