import { ArcRotateCamera, Color3, Color4, Engine, HighlightLayer, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class MeshHighlightingExmissiveInput {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Mesh Highlighting Exmissive Input'
    this.engine = new Engine(this.canvas, true, {stencil: true});
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    
    scene.clearColor = new Color4(0, 0, 0, 1)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 3, segments: 16})

    const mat = new StandardMaterial('mat')
    mat.emissiveTexture = new Texture('https://playground.babylonjs.com/textures/misc.jpg')
    mat.emissiveTexture.uOffset = -0.1
    sphere.material = mat

    const hl = new HighlightLayer('hl')
    hl.addMesh(sphere, Color3.Black(), true)
    hl.blurHorizontalSize = 1.5
    hl.blurVerticalSize = 1.5

    return scene;
  }
}