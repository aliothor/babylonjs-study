import { Color3, Engine, GlowLayer, Scene, SceneLoader } from "babylonjs";
import 'babylonjs-loaders'

export default class ControllingGlowColorPerMesh {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Controlling Glow Color Per Mesh'
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
      const gl = new GlowLayer('gl', scene, {
        mainTextureSamples: 4
      })
      
      scene.createDefaultCameraOrLight(true, true, true)

      const helper = scene.createDefaultEnvironment()
      helper?.setMainColor(Color3.Gray())

      gl.customEmissiveColorSelector = (mesh, subMesh, material, result) => {
        if (mesh.name == 'Wall') {
          result.set(0, 1, 1, 1)
        } else {
          if (material.emissiveColor) {
            const color = material.emissiveColor
            result.set(color.r, color.g, color.b, 1)
          } else {
            result.set(0, 0, 0, 1)
          }
        }
      }
    })

    return scene;
  }
}