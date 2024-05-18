import { ArcRotateCamera, Color4, DefaultRenderingPipeline, DirectionalLight, Engine, HemisphericLight, MeshBuilder, NodeMaterial, Scene, Vector3 } from "babylonjs";

export default class IncredibleOceanShader {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Incredible NME Ocean Shader'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.6, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.wheelPrecision = 512
    camera.pinchPrecision = 1024

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const dl = new DirectionalLight('dl', new Vector3(2, -1, -2.5))
    dl.intensity = 2

    scene.clearColor = Color4.FromHexString('#505D85FF')

    const ground = MeshBuilder.CreateGround('ground', {width: 2, height: 2, subdivisions: 128})
    ground.scaling = new Vector3(3, 3, 3)
    ground.rotation.y = Math.PI

    NodeMaterial.ParseFromSnippetAsync('#3FU5FG#1').then(mat => {
      ground.material = mat
    })

    const addPostEffects = () => {
      const pipeline = new DefaultRenderingPipeline(
        'defaultPipeline',
        false,
        scene,
        [camera]
      )

      pipeline.bloomEnabled = true
      pipeline.bloomThreshold = 0
      pipeline.bloomKernel = 0.35
      pipeline.bloomScale = 0.5

      pipeline.grainEnabled = true
      pipeline.grain.intensity = 8
      pipeline.grain.animated = true

      pipeline.chromaticAberrationEnabled = true
      pipeline.chromaticAberration.aberrationAmount = 65.1
      pipeline.chromaticAberration.radialIntensity = 2

      pipeline.sharpenEnabled = true
      pipeline.sharpen.edgeAmount = 0.15
    }

    addPostEffects()

    return scene;
  }
}