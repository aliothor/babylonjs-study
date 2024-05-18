import { Color3, Engine, GlowLayer, Scene, SceneLoader } from "babylonjs";
import 'babylonjs-loaders'

export default class MakingMeshesGlow {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Making Meshes Glow'
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
    })

    return scene;
  }
}