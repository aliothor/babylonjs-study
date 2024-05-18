import { ArcRotateCamera, Camera, Color4, CubeTexture, Engine, HemisphericLight, Mesh, NodeMaterial, Scene, SceneLoader, Texture, TextureBlock, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class CustomBuffersInNodeMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Buffers in Node Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    // camera.attachControl(this.canvas, true);   
    
    const width = this.engine.getRenderWidth()
    const height = this.engine.getRenderHeight()
    const ratio = width / height
    const orthoSize = 0.75    
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA
    camera.orthoLeft = ratio * -orthoSize
    camera.orthoRight = ratio * orthoSize
    camera.orthoTop = orthoSize
    camera.orthoBottom = -orthoSize

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // add in IBL with linked environment
    const env = CubeTexture.CreateFromPrefilteredData('https://patrickryanms.github.io/BabylonJStextures/Demos/nmeRandomizedInstances/assets/env/studio.env', scene)
    env.name = 'studioIBL'
    env.gammaSpace = false
    env.rotationY = 1.9
    scene.environmentTexture = env
    scene.environmentIntensity = 1

    const scaling = 15
    SceneLoader.AppendAsync('https://patrickryanms.github.io/BabylonJStextures/Demos/nmeRandomizedInstances/assets/gltf/', 'shaderSphere.glb').then(async result => {
      const root = result.meshes[0]
      const sphere = root.getChildren<Mesh>()[0]
      sphere.material?.dispose()
      sphere.scaling = new Vector3(scaling, scaling, -scaling)
      sphere.registerInstancedBuffer('color', 4)
      sphere.instancedBuffers.color = new Color4(Math.random(), Math.random(), 0, 1)
      sphere.position = new Vector3(0.5, 0.5, 0)
      sphere.setParent(null)
      
      // // create material
      NodeMaterial.IgnoreTexturesAtLoadTime = true
      const sphereBaseColor = new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/nmeRandomizedInstances/assets/textures/woodGrain_sphere_baseColor.png')
      const sphereNormal = new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/nmeRandomizedInstances/assets/textures/woodGrain_sphere_normal.png')

      const sphereShader = await NodeMaterial.ParseFromFileAsync('shaderSphere', 'https://patrickryanms.github.io/BabylonJStextures/Demos/nmeRandomizedInstances/assets/shaders/woodSphereShader.json', scene)
      sphereShader.build(false);
      (sphereShader.getBlockByName('baseColorTex') as TextureBlock).texture = sphereBaseColor;
      (sphereShader.getBlockByName('normalTex') as TextureBlock).texture = sphereNormal
      sphere.material = sphereShader

      // create instances
      const rows = 3
      const cols = 3
      const spacing = 0.25
      const maxSize = sphere.getBoundingInfo().boundingBox.maximum
      const minSize = sphere.getBoundingInfo().boundingBox.minimum
      const xSize = (maxSize.x - minSize.x) * scaling
      const ySize = (maxSize.y - minSize.y) * scaling
      let rowPos = -((rows * ySize + (rows - 1) * spacing) / 2) + ySize / 2
      let colPos = (cols * xSize + (cols - 1) * spacing) / -2 + xSize / 2
      const colStart = colPos
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const inst = sphere.createInstance('sphere' + r + c)
          inst.setParent(sphere.parent)
          inst.alwaysSelectAsActiveMesh = true
          inst.instancedBuffers.color = new Color4(Math.random(), Math.random(), 0, 1)
          inst.position = new Vector3(colPos, rowPos, 0)
          colPos = colPos + xSize + spacing
        }
        rowPos = rowPos + ySize + spacing
        colPos = colStart
      }
      sphere.isVisible = false
    })


    return scene;
  }
}