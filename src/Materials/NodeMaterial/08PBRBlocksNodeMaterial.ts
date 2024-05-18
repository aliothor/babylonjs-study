import { ArcRotateCamera, BaseTexture, Color3, CubeTexture, DirectionalLight, Engine, Material, MeshBuilder, NodeMaterial, PBRMaterial, Scene, ShadowGenerator, Texture, Vector3 } from "babylonjs";

export default class PBRBlocksNodeMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'PBR Blocks Node Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const url = 'https://playground.babylonjs.com/textures/'
    scene.environmentTexture = new CubeTexture(`${url}country.env`, scene)
    scene.createDefaultSkybox(scene.environmentTexture, false, 1000, 0, false)

    const createView = (layerMask: number, cameraPos: number) => {
      const camera = new ArcRotateCamera('camera' + layerMask, -Math.PI / 2, Math.PI / 2.5, 7, new Vector3(0, 0, 0));
      camera.attachControl(this.canvas, true);
      camera.viewport.width = 0.5
      camera.viewport.x = cameraPos
      camera.layerMask = layerMask

      const lightDir = new DirectionalLight('dir' + layerMask, new Vector3(1, -1, 1))
      lightDir.intensity = 10
      lightDir.includeOnlyWithLayerMask = layerMask
      lightDir.shadowMinZ = -2
      lightDir.shadowMaxZ = 15

      const ground = MeshBuilder.CreatePlane('ground' + layerMask, {size: 6})
      ground.layerMask = layerMask
      ground.rotation.x = Math.PI / 2
      ground.position.y = -1
      ground.receiveShadows = true

      const sphere = MeshBuilder.CreateSphere('sphere' + layerMask, {diameter: 2})
      sphere.layerMask = layerMask

      const sg = new ShadowGenerator(1024, lightDir)
      sg.usePercentageCloserFiltering = true
      sg.transparencyShadow = true
      sg.addShadowCaster(sphere)

      return {ground, sphere, camera}
    }

    // view1
    const view1 = createView(1, 0)

    const mat0 = new PBRMaterial('mat0')
    mat0.metallic = 0
    mat0.roughness = 0.8
    mat0.useRoughnessFromMetallicTextureAlpha = false
    mat0.useRoughnessFromMetallicTextureGreen = true
    mat0.useMetallnessFromMetallicTextureBlue = true

    mat0.albedoTexture = new Texture(`${url}rock.png`, scene, false, false)
    mat0.metallicTexture = new Texture(`${url}ground.jpg`, scene, false, false)
    mat0.opacityTexture = new Texture(`${url}cloud.png`, scene, false, false)
    mat0.bumpTexture = new Texture(`${url}rockn.png`, scene, false, false)
    mat0.ambientTexture = new Texture(`${url}fire.png`, scene, false, false)
    mat0.ambientTextureStrength = 0.35

    mat0.sheen.isEnabled = true
    mat0.sheen.roughness = 0.5
    mat0.sheen.texture = new Texture(`${url}fire.png`, scene, false, false)
    mat0.sheen.albedoScaling = true

    mat0.clearCoat.isEnabled = true
    mat0.clearCoat.roughness = 0.2
    mat0.clearCoat.indexOfRefraction = 3
    mat0.clearCoat.texture = new Texture(`${url}fire.png`, scene, false, false)
    mat0.clearCoat.bumpTexture = new Texture(`${url}rockn.png`, scene, false, false)
    mat0.clearCoat.isTintEnabled = true
    mat0.clearCoat.tintColor = new Color3(1, 1, 1)
    mat0.clearCoat.tintColorAtDistance = 20
    mat0.clearCoat.tintThickness = 20
    mat0.clearCoat.tintTexture = new Texture(`${url}ground.jpg`, scene, false, false)

    mat0.subSurface.maximumThickness = 5
    mat0.subSurface.tintColor = Color3.FromInts(173, 190, 1)
    mat0.subSurface.thicknessTexture = new Texture(`${url}reflectivity.png`, scene, false, false)
    mat0.subSurface.isRefractionEnabled = true
    mat0.subSurface.isTranslucencyEnabled = true
    mat0.subSurface.indexOfRefraction = 1.31

    view1.ground.material = mat0
    view1.sphere.material = mat0

    // view2
    const view2 = createView(2, 0.5)
    const materials: Material[] = [mat0]
    NodeMaterial.ParseFromSnippetAsync('#EPY8BV#6', scene).then(nodeMat => {
      view2.ground.material = nodeMat
      view2.sphere.material = nodeMat
      materials.push(nodeMat)
    })

    scene.activeCameras = [view1.camera, view2.camera]
    
    this.makeUI(materials, mat0.opacityTexture)

    return scene;
  }

  private makeUI(mats: Material[], opacityTexture: BaseTexture) {
    const app = document.getElementById('app')!

    function createTitle(leftPos: string, text: string) {
      const title = document.createElement('div')
      title.style.width = '150px'
      title.style.height = '34px'
      title.style.backgroundColor = 'green'
      title.style.color = 'white'
      title.style.position = 'absolute'
      title.style.bottom = '90px'
      title.style.left = leftPos + 'px'
      title.style.textAlign = 'center'
      title.style.fontSize = '20px'
      title.innerHTML = `<span>${text} material</span>`
      app.appendChild(title)

      return title
    }

    createTitle('400', 'PBR')
    createTitle('900', 'Node')

    const titleAlpha = createTitle('230', '')
    titleAlpha.innerHTML = '<span>Alpha</span><input id="alpha" type="checkbox" checked />'
    titleAlpha.style.top = '130px'
    const alpha = document.getElementById('alpha') as HTMLInputElement
    alpha.addEventListener('change', () => {
      (mats[0] as PBRMaterial).opacityTexture = alpha.checked ? opacityTexture : null
      if (mats.length > 1) {
        const nmat = mats[1] as NodeMaterial
        const blockPBR = nmat.getBlockByName('PBRMetallicRoughness')!
        const blockFragment = nmat.getBlockByName('FragmentOutput')!
        if (alpha.checked) {
          blockPBR.alpha.connectTo(blockFragment.a)
        } else {
          blockPBR.alpha.disconnectFrom(blockFragment.a)
        }
        nmat.build()
      }
    })
  }
  
}
