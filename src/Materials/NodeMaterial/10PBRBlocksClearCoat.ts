import { ArcRotateCamera, ClearCoatBlock, CubeTexture, Engine, Material, NodeMaterial, PBRMaterial, PBRMetallicRoughnessBlock, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class PBRBlocksClearCoat {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'PBR Blocks Clear Coat'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const url = 'https://playground.babylonjs.com/textures/'
    scene.environmentTexture = new CubeTexture(`${url}environment.env`, scene)
    scene.createDefaultSkybox(scene.environmentTexture, false, 1000, 0, false)

    const createView = (layerMask: number, cameraPos: number) => {
      const camera = new ArcRotateCamera('camera' + layerMask, -Math.PI / 2, Math.PI / 2.5, 1, new Vector3(0, 0, 0));
      camera.attachControl(this.canvas, true);
      camera.viewport.width = 0.5
      camera.viewport.x = cameraPos
      camera.layerMask = layerMask
      camera.minZ = 0.1
      camera.useAutoRotationBehavior = true

      return {camera}
    }

    // view1
    const view1 = createView(1, 0)

    // view2
    const view2 = createView(2, 0.5)
    const materials: Material[] = []
    SceneLoader.Append('https://models.babylonjs.com/', 'CarbonFiberWheel.glb', scene, () => {
      scene.meshes.forEach(m => {
        if (m.name != 'hdrSkyBox') {
          m.layerMask = 1
          if (m.material) materials.push(m.material)
        }
      })

      const numMeshes = scene.meshes.length
      SceneLoader.Append('https://models.babylonjs.com/', 'CarbonFiberWheel.glb', scene, () => {
        NodeMaterial.ParseFromSnippetAsync('#C3NEY1#4', scene).then(nodeMat => {
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

    const titleClearcoat = createTitle('230', '')
    titleClearcoat.innerHTML = '<span>ClearCoat</span><input id="clearcoat" type="checkbox" checked />'
    titleClearcoat.style.top = '130px'
    const clearcoat = document.getElementById('clearcoat') as HTMLInputElement
    clearcoat.addEventListener('change', () => {
      if (mats.length > 0) (mats[0] as PBRMaterial).clearCoat.isEnabled = clearcoat.checked
      if (mats.length > 1) {
        const nmat = mats[1] as NodeMaterial
        const blockPBR = nmat.getBlockByName('PBRMetallicRoughness') as PBRMetallicRoughnessBlock
        const blockClearcoat = nmat.getBlockByName('ClearCoat') as ClearCoatBlock
        if (clearcoat.checked) {
          blockClearcoat.clearcoat.connectTo(blockPBR.clearcoat)
        } else {
          blockClearcoat.clearcoat.disconnectFrom(blockPBR.clearcoat)
        }
        nmat.build()
      }
    })
  }
  
}
