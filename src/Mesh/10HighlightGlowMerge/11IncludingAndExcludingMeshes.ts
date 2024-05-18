import { Color3, Engine, GlowLayer, Mesh, PBRMaterial, Scene, SceneLoader } from "babylonjs";
import 'babylonjs-loaders'

export default class IncludingAndExcludingMeshes {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Including and Excluding Meshes'
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

    // loade model
    SceneLoader.Append('https://www.babylonjs.com/Assets/NeonPipe/glTF/', 'NeonPipe.gltf', scene, function() {
      const gl = new GlowLayer('gl')
      
      scene.createDefaultCameraOrLight(true, true, true)

      const helper = scene.createDefaultEnvironment()
      helper?.setMainColor(Color3.Gray())

      const wallMat = scene.getMaterialByName('WallMat') as PBRMaterial
      wallMat.emissiveColor = Color3.Teal()

      const wall = scene.getMeshByName('Wall') as Mesh
      const light = scene.getMeshByName('Light') as Mesh

      // exclude
      // gl.addExcludedMesh(wall)
      // gl.addExcludedMesh(light)
      // setTimeout(() => {
      //   gl.removeExcludedMesh(wall)
      // }, 3000);

      // include
      gl.addIncludedOnlyMesh(light)
      gl.addIncludedOnlyMesh(wall)
      setTimeout(() => {
        gl.removeIncludedOnlyMesh(wall)
      }, 3000);
    })

    return scene;
  }
}