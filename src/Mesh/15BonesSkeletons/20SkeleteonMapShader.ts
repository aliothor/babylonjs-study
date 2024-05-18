import { Animation, AnimationPropertiesOverride, ArcRotateCamera, Color3, Debug, DirectionalLight, Engine, HemisphericLight, Scene, SceneLoader, ShadowGenerator, Vector3 } from "babylonjs";

export default class SkeleteonMapShader {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Skeleteon Map Shader'
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

    const colorMap = [
      {
        color: new Color3(1, 0.38, 0.18),
        location: 0
      },
      {
        color: new Color3(.59, 0.18, 1.00),
        location: 0.2
      },
      {
        color: new Color3(0.59, 1, 0.18),
        location: 0.4
      },
      {
        color: new Color3(1, 0.87, 0.17),
        location: 0.6
      },
      {
        color: new Color3(1, 0.17, 0.42),
        location: 0.8
      },
      {
        color: new Color3(0.17, 0.68, 1.0),
        location: 1.0
      }
    ]

    const shader = Debug.SkeletonViewer.CreateSkeletonMapShader({ skeleton, colorMap }, scene)
    mesh.material = shader


    return scene;
  }
}