import { Animation, AnimationPropertiesOverride, ArcRotateCamera, Color3, Debug, DirectionalLight, Engine, HemisphericLight, Scene, SceneLoader, ShadowGenerator, Vector3 } from "babylonjs";

export default class UsingDebugSkeletionViewer {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Debug SkeletionViewer'
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

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 1, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 2
    camera.upperRadiusLimit = 10
    camera.wheelDeltaPercentage = 0.01

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.6
    const dirLight = new DirectionalLight('dirLight', new Vector3(0, -0.5, -1))
    dirLight.position = new Vector3(0, 5, 5)

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/', 'dummy3.babylon')

    const mesh = meshes[0]
    const skeleton = skeletons[0]

    const helper = scene.createDefaultEnvironment({ enableGroundShadow: true })!
    helper.setMainColor(Color3.Gray())
    helper.ground!.position.y += 0.01

    // shadows
    const sg = new ShadowGenerator(1024, dirLight)
    sg.useBlurExponentialShadowMap = true
    sg.blurKernel = 32
    sg.addShadowCaster(mesh, true)
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].receiveShadows = false
    }

    Animation.AllowMatricesInterpolation = true
    // robot
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride()
    skeleton.animationPropertiesOverride.enableBlending = true
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05
    skeleton.animationPropertiesOverride.loopMode = 1
    const runRange = skeleton.getAnimationRange('YBot_Run')
    if (runRange) scene.beginAnimation(skeleton, runRange.from, runRange.to, true)

    // await scene.debugLayer.show({ embedMode: true })
    // scene.debugLayer.select(skeleton)

    new Debug.SkeletonViewer(skeleton, mesh, scene, false, mesh.renderingGroupId ? mesh.renderingGroupId + 1 : 1, {
      pauseAnimations: false,
      returnToRest: false,
      computeBonesUsingShaders: true,
      useAllBones: false,
      displayMode: Debug.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
      displayOptions: {
        sphereBaseSize: 1,
        sphereFactor: 0.9,
        sphereScaleUnit: 10,
        midStep: 0.25,
        midStepFactor: 0.05
      }
    })

    return scene;
  }
}