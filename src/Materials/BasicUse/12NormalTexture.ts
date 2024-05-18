import { ArcRotateCamera, Color4, DirectionalLight, Engine, NodeMaterial, Scene, SceneLoader, Tools, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class NormalTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Normal Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(.1, .1, .1)

    const camera = new ArcRotateCamera('camera', Tools.ToRadians(-270), Tools.ToRadians(90), 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, 0, 0), scene);
    light.direction = new Vector3(0.5, -0.75, -0.4)
    light.intensity = 1

    // Async loading list
    const promises = []

    // normal texture
    const directXMat = new NodeMaterial('directXMat', scene, {emitComments: false})
    const directX_invMat = new NodeMaterial('directX_invMat', scene, {emitComments: false})

    // load assets
    promises.push(SceneLoader.AppendAsync('/Materials/normalFormatTest.glb'))
    promises.push(SceneLoader.AppendAsync('/Materials/normalFormatTest.babylon'))
    promises.push(NodeMaterial.ParseFromFileAsync('directXMat', '/Materials/directXnodeMat.json', scene, undefined, undefined, directXMat))
    promises.push(NodeMaterial.ParseFromFileAsync('directX_invMat', '/Materials/directXNode_InvertY_Mat.json', scene, undefined, undefined, directX_invMat))

    // callback when assets are loaded
    Promise.all(promises).then(() => {
      // meshes
      const directXMesh = scene.getMeshByName('directX')
      const babylonDXMesh = scene.getMeshByName('direcX1_babylon')

      // materials
      directXMesh!.material = directXMat
      babylonDXMesh!.material = directX_invMat

      // display loading screen
      this.engine.displayLoadingUI()
      scene.executeWhenReady(() => {
        this.engine.hideLoadingUI()
      })
    })

    // scene.debugLayer.show()

    return scene;
  }
}