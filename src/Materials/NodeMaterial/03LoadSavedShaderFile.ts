import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, NodeMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class LoadSavedShaderFile {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Load a Saved Shader File'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMeshAsync('', 'https://piratejc.github.io/assets/pirateFort/', 'cannon.glb').then(async cannoMeshes => {
      const cannon = cannoMeshes.meshes[1]
      const cannonMount = cannoMeshes.meshes[2]
      cannonMount.setParent(null)
      cannoMeshes.meshes[0].dispose()

      scene.stopAllAnimations()

      const nodeMat = await NodeMaterial.ParseFromFileAsync('hypnosis', 'https://piratejc.github.io/assets/hypnosis.json', scene)
      // const nodeMat = await NodeMaterial.ParseFromSnippetAsync('#XGE685')

      cannon.material = nodeMat

      // await scene.debugLayer.show({ showExplorer: false })
      // scene.debugLayer.select(nodeMat)

      // nodeMat.edit()

    })

    return scene;
  }
}