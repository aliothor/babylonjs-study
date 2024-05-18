import { ArcRotateCamera, Color3, CreateGreasedLine, CubeTexture, Engine, GlowLayer, GreasedLineMesh, GreasedLineMeshWidthDistribution, KeyboardEventTypes, MeshBuilder, Scalar, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class LightSpeedEffect {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Light Speed Effect'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // skybox
    const skybox = MeshBuilder.CreateBox('universe', {size: 3000})
    const skyMat = new StandardMaterial('universe')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture('https://playgrounds.babylonjs.xyz/universe', scene)
    skyMat.disableLighting = true
    skybox.material = skyMat

    // info
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const txt = new TextBlock()
    txt.text = 'Press space to for/pause light speed'
    txt.color = 'white'
    txt.fontSize = 24
    adt.addControl(txt)

    this.demo(scene, camera)

    return scene;
  }

  demo(scene: Scene, camera: ArcRotateCamera) {
    // init
    const count = 3000
    const minRadius = 10
    const maxRadius = 200
    const minZ = 0
    const maxZ = 100
    const minLengh = 20
    const maxLengh = 100
    const ratio = 16 / 9
    let instance: GreasedLineMesh | undefined = undefined

    for (let i = 0;i < count; i++) {
      const radius = Scalar.RandomRange(minRadius, maxRadius)
      const a = Scalar.RandomRange(0, Math.PI * 2)
      const x = Math.cos(a) * radius
      const y = (Math.sin(a) * radius) / ratio
      const z = Scalar.RandomRange(minZ, maxZ)
      const lengh = Scalar.RandomRange(minLengh, maxLengh)
      const line = [new Vector3(x, y, z), new Vector3(x, y, z + lengh)]

      let width = Math.random() < 0.8
        ? Scalar.RandomRange(5, 16)
        : Scalar.RandomRange(36, 40)
      let color = Color3.White()
      if (Math.random() < 0.2) {
        color = new Color3(0.4, 0.4, 1)
        width = 2
      }
      width /= 10

      const colors = [color]
      const widths = [width * 0.2, width * 0.2, width, width]

      const mesh = CreateGreasedLine('lines', {
        lazy: true,
        updatable: true,
        points: line,
        instance,
        widths,
        widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START
      }, {
        width: 0.2,
        useColors: true,
        colors,
        visibility: 0.01
      })
      if (!instance) instance = mesh
    }

    if (instance) {
      instance.alwaysSelectAsActiveMesh = true
      const segmentWidths = instance.widths
      instance.updateLazy()

      const glow = new GlowLayer('glow', scene, {
        blurKernelSize: 64
      })
      glow.intensity = 2
      glow.referenceMeshToUseItsOwnMaterial(instance)
      scene.autoClear = false

      let visibility = 0.05
      const scale = new Vector3(1, 1, 1)
      let play = false
      scene.onKeyboardObservable.add(e => {
        if (e.type == KeyboardEventTypes.KEYUP) {
          play = !play
        }
      })

      scene.onBeforeRenderObservable.add(() => {
        if (!play) return
        for (let i = 0; i < segmentWidths.length; i++) {
          segmentWidths[i] *= 1.004
        }

        if (instance) {
          instance.scaling = scale
          instance.widths = segmentWidths
          instance.greasedLineMaterial!.visibility = visibility
        }

        visibility += 0.001 * scene.getAnimationRatio()
        if (visibility > 1) {
          play = false
        }
        scale.z *= 1.005

      })

      camera.zoomOn([instance])
      camera.radius = 1000
      camera.minZ = 0.1
      camera.maxZ = 5000
      camera.fov = 0.2
      camera.detachControl()
    }
  }
}