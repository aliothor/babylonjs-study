import { AbstractMesh, Color3, Engine, HemisphericLight, Material, MaterialDefines, MaterialPluginBase, MeshBuilder, Nullable, Scene, StandardMaterial, UniversalCamera, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class ApplyingPluginToSingleMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Applying Plugin To A Single Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new UniversalCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero())
    camera.attachControl(this.canvas, true)

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    // meshes
    const sphere1 = MeshBuilder.CreateSphere('sphere1', {diameter: 2})
    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(1, 0, 0)
    sphere1.material = mat1
    sphere1.position.y = 3

    const sphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 2})
    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseColor = new Color3(1, 0, 0)
    sphere2.material = mat2
    sphere2.position.y = 1
    const myPlugin = new BlackAndWhitePluginMaterial(mat2)

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})
    const gMat = new StandardMaterial('gMat')
    gMat.diffuseColor = new Color3(0.8, 0.5, 0)

    return scene;
  }
}

class BlackAndWhitePluginMaterial extends MaterialPluginBase {
  constructor(material: Material) {
    super(material, 'BlackAndWhite', 200, {'BLACKANDWHITE': false})
    this._enable(true)
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
      defines['BLACKANDWHITE'] = true
  }

  getClassName(): string {
      return 'BlackAndWhitePluginMaterial'
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
      if (shaderType == 'fragment') {
        return {
          'CUSTOM_FRAGMENT_MAIN_END': `
            float luma = gl_FragColor.r * 0.299 + gl_FragColor.g * 0.587 + gl_FragColor.b * 0.114;
            gl_FragColor = vec4(luma, luma, luma, 1.0);
          `
        }
      }
      return null
  }
}