import { ArcRotateCamera, Engine, HemisphericLight, Scene, SceneLoader, SkeletonViewer, Vector3 } from "babylonjs";

export default class BoneWeightShader {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Bone Weight Shader'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/Dude/', 'Dude.babylon')

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    const dude = meshes[0]
    const skeleton = skeletons[0]
    let targetBoneIndex = 0
    const shader = SkeletonViewer.CreateBoneWeightShader({ skeleton, targetBoneIndex }, scene)

    meshes.forEach(m => {
      if (m.skeleton == skeleton) {
        m.material = shader
      }
    })

    let lastTick = Date.now()
    let interval = 500
    scene.registerBeforeRender(() => {
      shader.setFloat('targetBoneIndex', targetBoneIndex)
      let n = Date.now()
      if (n - lastTick > interval) {
        lastTick = n
        targetBoneIndex++
        if (targetBoneIndex >= skeleton.bones.length) {
          targetBoneIndex = 0
        }
      }
    })

    return scene;
  }
}