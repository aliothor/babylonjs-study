import { AbstractMesh, ArcRotateCamera, Color3, CubeTexture, Engine, InputBlock, Material, NodeMaterial, PBRMaterial, RefractionBlock, Scene, SceneLoader, SubSurfaceBlock, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class PBRBlocksSubSurface {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'PBR Blocks Sub Surface'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const url = 'https://playground.babylonjs.com/'
    scene.environmentTexture = new CubeTexture(`${url}textures/environment.env`, scene)
    scene.createDefaultSkybox(scene.environmentTexture, false, 1000, 0, false)

    const createView = (layerMask: number, cameraPos: number) => {
      const camera = new ArcRotateCamera('camera' + layerMask, -Math.PI / 2, Math.PI / 2, 130, new Vector3(5, 4.3, 70.3));
      camera.attachControl(this.canvas, true);
      camera.viewport.width = 0.5
      camera.viewport.x = cameraPos
      camera.layerMask = layerMask

      return {camera}
    }

    // view1
    const view1 = createView(1, 0)

    const mat0 = new PBRMaterial('mat0')
    mat0.metallic = 0
    mat0.roughness = 0.12
    mat0.useRoughnessFromMetallicTextureAlpha = false
    mat0.useRoughnessFromMetallicTextureGreen = true
    mat0.useMetallnessFromMetallicTextureBlue = true

    mat0.subSurface.isRefractionEnabled = true
    mat0.subSurface.maximumThickness = 2.0
    mat0.subSurface.tintColor = new Color3(1, 1, 0.941).toLinearSpace()
    mat0.subSurface.refractionIntensity = 1
    mat0.subSurface.indexOfRefraction = 2.42
    mat0.subSurface.isTranslucencyEnabled = true

    // view2
    const view2 = createView(2, 0.5)
    const materials: Material[] = [mat0]
    SceneLoader.Append(`${url}scenes/`, 'skull.babylon', scene, () => {
      scene.lights[scene.lights.length - 1].dispose()
      scene.cameras[scene.cameras.length - 1].dispose()

      const meshRotate: AbstractMesh[] = []
      scene.meshes.forEach(m => {
        if (m.name != 'hdrSkyBox') {
          m.layerMask = 1
          m.material = mat0
          m.useVertexColors = false
          meshRotate.push(m)
        }
      })

      const numMeshes = scene.meshes.length
      SceneLoader.Append(`${url}scenes/`, 'skull.babylon', scene, () => {
        NodeMaterial.ParseFromSnippetAsync('#100NDL#1', scene).then(nodeMat => {
          materials.push(nodeMat)
          scene.meshes.forEach((m, idx) => {
            if (idx >= numMeshes && m.name != 'hdrSkyBox') {
              m.layerMask = 2
              m.material = nodeMat
              meshRotate.push(m)
            }
          })
        })

        scene.onBeforeRenderObservable.add(() => {
          meshRotate.forEach(m => m.rotation.y += 0.005)
        })

      })
    })

    scene.activeCameras = [view1.camera, view2.camera]
    
    this.makeUI(materials)

    return scene;
  }

  private makeUI(mats: Material[]) {
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

    const titleRefraction = createTitle('230', '')
    titleRefraction.innerHTML = '<span>Refraction</span><input id="refraction" type="checkbox" checked />'
    titleRefraction.style.top = '130px'
    const refraction = document.getElementById('refraction') as HTMLInputElement
    refraction.addEventListener('change', () => {
      if (mats.length > 0) (mats[0] as PBRMaterial).subSurface.isRefractionEnabled = refraction.checked
      if (mats.length > 1) {
        const nmat = mats[1] as NodeMaterial
        const blockSubsurface = nmat.getBlockByName('SubSurface') as SubSurfaceBlock
        const blockRefraction = nmat.getBlockByName('Refraction') as RefractionBlock
        if (refraction.checked) {
          blockRefraction.refraction.connectTo(blockSubsurface.refraction)
        } else {
          blockRefraction.refraction.disconnectFrom(blockSubsurface.refraction)
        }
        nmat.build()
      }
    })

    const titleTranslucency = createTitle('230', '')
    titleTranslucency.innerHTML = '<span>Translucency</span><input id="translucency" type="checkbox" checked />'
    titleTranslucency.style.top = '170px'
    const translucency = document.getElementById('translucency') as HTMLInputElement
    translucency.addEventListener('change', () => {
      if (mats.length > 0) (mats[0] as PBRMaterial).subSurface.isTranslucencyEnabled = translucency.checked
      if (mats.length > 1) {
        const nmat = mats[1] as NodeMaterial
        const blockSubsurface = nmat.getBlockByName('SubSurface') as SubSurfaceBlock
        const blockTranslucencyIntensity = nmat.getBlockByName('SubSurface translucency intensity') as InputBlock
        const blockTranslucencyDiffDist = nmat.getBlockByName('SubSurface translucency diffusion distance') as InputBlock
        if (translucency.checked) {
          blockTranslucencyIntensity.output.connectTo(blockSubsurface.translucencyIntensity)
          blockTranslucencyDiffDist.output.connectTo(blockSubsurface.translucencyDiffusionDist)
        } else {
          blockTranslucencyIntensity.output.disconnectFrom(blockSubsurface.translucencyIntensity)
          blockTranslucencyDiffDist.output.disconnectFrom(blockSubsurface.translucencyDiffusionDist)
        }
        nmat.build()
      }
    })
  }
  
}
