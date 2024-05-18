import { ArcRotateCamera, Color3, CubeTexture, Engine, Material, NodeMaterial, PBRMaterial, PBRMetallicRoughnessBlock, Scene, SceneLoader, SheenBlock, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class PBRBlocksSheen {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'PBR Blocks Sheen'
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
      const camera = new ArcRotateCamera('camera' + layerMask, -Math.PI / 2, Math.PI / 2.5, 0.14, new Vector3(0, 0, 0));
      camera.attachControl(this.canvas, true);
      camera.viewport.width = 0.5
      camera.viewport.x = cameraPos
      camera.layerMask = layerMask
      camera.minZ = 0.01
      camera.useAutoRotationBehavior = true

      return {camera}
    }

    // view1
    const view1 = createView(1, 0)

    const mat0 = new PBRMaterial('mat0')
    mat0.metallic = 0
    mat0.roughness = 0.8
    mat0.useRoughnessFromMetallicTextureAlpha = false
    mat0.useRoughnessFromMetallicTextureGreen = true
    mat0.useMetallnessFromMetallicTextureBlue = true

    mat0.albedoColor = Color3.FromInts(12, 60, 222)
    mat0.sheen.isEnabled = true
    mat0.sheen.roughness = 0.5
    mat0.sheen.texture = new Texture(`${url}fire.png`, scene, false, false)

    // view2
    const view2 = createView(2, 0.5)
    const materials: Material[] = [mat0]
    SceneLoader.Append('https://models.babylonjs.com/cloth/', 'cloth_meshV1.glb', scene, () => {
      scene.meshes.forEach(m => {
        if (m.name != 'hdrSkyBox') {
          m.layerMask = 1
          m.material = mat0
        }
      })

      const numMeshes = scene.meshes.length
      SceneLoader.Append('https://models.babylonjs.com/cloth/', 'cloth_meshV1.glb', scene, () => {
        NodeMaterial.ParseFromSnippetAsync('#V3R0KJ', scene).then(nodeMat => {
          materials.push(nodeMat)
          scene.meshes.forEach((m, idx) => {
            if (idx >= numMeshes && m.name != 'hdrSkyBox') {
              m.layerMask = 2
              m.material = nodeMat
            }
          })
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

    const titleSheen = createTitle('230', '')
    titleSheen.innerHTML = '<span>Sheen</span><input id="sheen" type="checkbox" checked />'
    titleSheen.style.top = '130px'
    const sheen = document.getElementById('sheen') as HTMLInputElement
    sheen.addEventListener('change', () => {
      (mats[0] as PBRMaterial).sheen.isEnabled = sheen.checked
      if (mats.length > 1) {
        const nmat = mats[1] as NodeMaterial
        const blockPBR = nmat.getBlockByName('PBRMetallicRoughness') as PBRMetallicRoughnessBlock
        const blockSheen = nmat.getBlockByName('Sheen') as SheenBlock
        if (sheen.checked) {
          blockSheen.sheen.connectTo(blockPBR.sheen)
        } else {
          blockSheen.sheen.disconnectFrom(blockPBR.sheen)
        }
        nmat.build()
      }
    })
  }
  
}
