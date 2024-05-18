import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, HighlightLayer, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class BrokenAndFixedTransparencyMeshHighlight {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Broken And Fixed Transparency Mesh Highlight'
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

    const camera = new ArcRotateCamera('camera', 1.45, 1.5, 20, new Vector3(-10, 5, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const skybox = MeshBuilder.CreateBox('skybox', {size: 20})
    const skyMat = new StandardMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skyMat.disableLighting = true
    skybox.material = skyMat
    skybox.visibility = 0.5

    const hl = new HighlightLayer('hl')
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(1, 1, 0)

    for (let i = 0; i < 200; i++) {
      const box = MeshBuilder.CreateBox('box' + i, {size: 5})
      box.material = mat
      box.position = new Vector3(-20, 0, -i * 20)

      hl.addMesh(box, Color3.White())
    }

    hl.addExcludedMesh(skybox)

    return scene;
  }
}