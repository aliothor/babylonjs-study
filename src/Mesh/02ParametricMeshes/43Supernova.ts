import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GlowLayer, HemisphericLight, Layer, Scene, Texture, Vector3, VolumetricLightScatteringPostProcess } from "babylonjs";

export default class Supernova {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Supernova'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 150, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)
    light.intensity = 0.15

    const url = 'https://playgrounds.babylonjs.xyz/wp7505888-purple-stars-wallpapers.jpg'
    const layer = new Layer('bg', url, scene, true)

    // 1
    const points1 = [
      [
        0, -1, 0,
        0, 0.2, 0,
        0, 1, 0
      ],
      [
        -8, 0, 0,
        6, 0.5, 0
      ],
      [
        -4, -1, 0,
        4, 1, 0
      ]
    ]
    const widths1 = [
      6, 10,
      22, 42,
      10, 4
    ]

    const mesh1 = CreateGreasedLine('star', {
      points: points1,
      widths: widths1
    })
    
    // 2
    const points2 = [
      0, -6, 1,
      0, 0, 1,
      0, 6, 1
    ]
    const widths2 = [
      100, 100,
      10, 10,
      100, 100
    ]

    const mesh2 = CreateGreasedLine('star-outer-1', {
      points: points2,
      widths: widths2
    }, {
      color: Color3.Purple()
    })
    
    // 3
    const points3 = [
      0, -9, 1,
      0, 0, 1,
      0, 9, 1
    ]
    const widths3 = [
      10, 10,
      120, 120,
      10, 10
    ]

    const mesh3 = CreateGreasedLine('star-outer-2', {
      points: points3,
      widths: widths3
    }, {
      color: Color3.Blue()
    })

    // glow
    const glow = new GlowLayer('glow')
    glow.intensity = 16
    glow.blurKernelSize = 300
    glow.referenceMeshToUseItsOwnMaterial(mesh2)
    glow.referenceMeshToUseItsOwnMaterial(mesh3)

    // light
    const godrays = new VolumetricLightScatteringPostProcess('godrays', 1, camera, mesh1, 100, Texture.BILINEAR_SAMPLINGMODE, this.engine, false)
    godrays.exposure = 0.12
    godrays.decay = 0.99815
    godrays.weight = 0.98767
    godrays.density = 0.956

    
    return scene;
  }
}