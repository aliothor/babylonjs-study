import { Animation, AnimationGroup, ArcRotateCamera, Camera, Color4, Engine, HemisphericLight, IAnimationKey, MorphTarget, NodeMaterial, Nullable, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class MorphTargetsFromGLTFFile {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Morph Targets From a gltf File'
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
    // camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = Color4.FromInts(72, 128, 215, 255)

    // determine ratio of rendered canvans
    let width = this.engine.getRenderWidth()
    let height = this.engine.getRenderHeight()
    let ratio = width / height
    const orthoMeasure = 2

    camera.mode = Camera.ORTHOGRAPHIC_CAMERA
    camera.orthoLeft = ratio * orthoMeasure * -1
    camera.orthoRight = ratio * orthoMeasure
    camera.orthoBottom = orthoMeasure * -1
    camera.orthoTop = orthoMeasure

    // reset orthographic ratio when canvas is resized
    this.engine.onResizeObservable.add(() => {
      if (this.engine.getRenderWidth() != width || this.engine.getRenderHeight() != height) {
        width = this.engine.getRenderWidth()
        height = this.engine.getRenderHeight()
        ratio = width / height
        camera.orthoLeft = ratio * orthoMeasure * -1
        camera.orthoRight = ratio * orthoMeasure
        camera.orthoBottom = orthoMeasure * -1
        camera.orthoTop = orthoMeasure
      }
    })

    // load meshes and shader
    const loadModel = await SceneLoader.ImportMeshAsync('', 'https://models.babylonjs.com/Demos/mograph/morphLoader.glb')
    const loadMat = await NodeMaterial.ParseFromFileAsync('loadMat', 'https://models.babylonjs.com/Demos/mograph/mographShader.json', scene)

    loadMat.build(false)

    const meshes = loadModel.meshes
    const morphTargets: MorphTarget[] = []
    meshes.forEach(m => {
      m.material = loadMat
      if (m.morphTargetManager != null) {
        morphTargets.push(m.morphTargetManager.getTarget(0))
      }
    })

    // get animation group from glb
    const loadingSpin = loadModel.animationGroups[0]

    // set up morph target animations keyframes

    const morphAnimations = {
      "leftMorph": [
        { frame: 0, value: 0 },
        { frame: 20, value: 0 },
        { frame: 35, value: 1 },
        { frame: 115, value: 1 },
        { frame: 130, value: 0 },
        { frame: 400, value: 0 }
      ],
      "centerMorph": [
        { frame: 0, value: 0 },
        { frame: 135, value: 0 },
        { frame: 150, value: 1 },
        { frame: 220, value: 1 },
        { frame: 235, value: 0 },
        { frame: 400, value: 0 }
      ],
      "rightMorph": [
        { frame: 0, value: 0 },
        { frame: 250, value: 0 },
        { frame: 265, value: 1 },
        { frame: 335, value: 1 },
        { frame: 350, value: 0 },
        { frame: 400, value: 0 }
      ]
    }

    function playAnimation(target: MorphTarget, animValue: string, animKeys: IAnimationKey[], group: Nullable<AnimationGroup>, start: boolean) {
      const anim = new Animation('anim', animValue, 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
      anim.setKeys(animKeys)
      if (group != null) {
        group.addTargetedAnimation(anim, target)
        if (start) {
          group.play(true)
        }
      }
    }

    playAnimation(morphTargets[0], 'influence', morphAnimations.leftMorph, loadingSpin, false)
    playAnimation(morphTargets[1], 'influence', morphAnimations.centerMorph, loadingSpin, false)
    playAnimation(morphTargets[2], 'influence', morphAnimations.rightMorph, loadingSpin, true)

    await scene.debugLayer.show({ embedMode: true })
    scene.debugLayer.select(loadingSpin)

    return scene;
  }
}