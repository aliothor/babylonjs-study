import { AbstractMesh, ArcRotateCamera, Color4, CubeTexture, Engine, NodeMaterial, NodeMaterialBlock, Scene, SceneLoader, Texture, Vector2, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Grid } from "babylonjs-gui";
import 'babylonjs-loaders'

export default class PulseWaveShader {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Pulse Wave Shader'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 0.728, 1.345, 35, new Vector3(0.32, -3.12, 0.26));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1
    camera.wheelDeltaPercentage = 0.1

    scene.clearColor = Color4.FromInts(56, 56, 58, 255)

    const server = 'https://patrickryanms.github.io/BabylonJStextures/Demos/waveShader/'

    // add in IBL with linked environment
    const env = CubeTexture.CreateFromPrefilteredData(server + 'assets/env/studio.env', scene)
    env.name = 'studioIBL'
    env.gammaSpace = false
    env.rotationY = 2.3667
    scene.environmentTexture = env
    scene.environmentIntensity = 1.0

    // load or create meshes in scene
    let bar: AbstractMesh
    const meshParams = {
      minX: 0,
      maxX: 0,
      minZ: 0,
      maxZ: 0
    }
    async function loadMeshes() {
      // load bars mesh
      const result = await SceneLoader.AppendAsync(server + 'assets/gltf/', 'bars.glb')
      for (let mesh of result.meshes) {
        if (mesh.name == 'bars') {
          bar = mesh
          meshParams.minX = mesh.getBoundingInfo().boundingBox.minimumWorld.x
          meshParams.maxX = mesh.getBoundingInfo().boundingBox.maximumWorld.x
          meshParams.minZ = mesh.getBoundingInfo().boundingBox.minimumWorld.z
          meshParams.maxZ = mesh.getBoundingInfo().boundingBox.maximumWorld.z
        }
      }
    }

    // create materials for scene meshes
    // ignore textures embedded in shader when loading
    NodeMaterial.IgnoreTexturesAtLoadTime = true
    const texBarColor = new Texture(server + 'assets/textures/barsColor_randomValue.png', scene, false, false, Texture.NEAREST_SAMPLINGMODE)
    texBarColor.wrapU = texBarColor.wrapV = Texture.CLAMP_ADDRESSMODE

    let straightWave: NodeMaterialBlock
    async function createMaterisls() {
      // node material for bars
      const barsMat = await NodeMaterial.ParseFromFileAsync('barsMat', server + 'assets/shaders/bars.json', scene)
      barsMat.build(false)
      barsMat.transparencyMode = 0

      // set bars material parameters
      barsMat.getBlockByName('baseColorTex').texture = texBarColor
      barsMat.getBlockByName('minX').value = meshParams.minX
      barsMat.getBlockByName('maxX').value = meshParams.maxX
      barsMat.getBlockByName('minZ').value = meshParams.minZ
      barsMat.getBlockByName('maxZ').value = meshParams.maxZ
      straightWave = barsMat.getBlockByName('straightWave')!

      // assign material to bars
      bar.material = barsMat
    }

    function createButton(name: string, gridPos: Vector2, value: number, container: Grid) {
      const btn = Button.CreateSimpleButton(name, name)
      btn.paddingTop = '30px'
      btn.width = 0.5
      btn.height = '70px'
      btn.color = 'white'
      btn.thickness = 1
      btn.background = 'transparent'
      btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
      btn.onPointerDownObservable.add(function() {
        straightWave.value = value
      })
      container.addControl(btn, gridPos.x, gridPos.y)
    }

    function createUI() {
      // UI grid
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
      const grid = new Grid('grid')
      grid.addRowDefinition(1)
      grid.addColumnDefinition(0.5)
      grid.addColumnDefinition(0.5)
      grid.height = 0.15
      grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
      grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
      adt.addControl(grid)

      // create buttons
      createButton('Straight Wave', new Vector2(0, 0), 1, grid)
      createButton('Circular Wave', new Vector2(0, 1), 0, grid)
    }


    setTimeout(async () => {
      await loadMeshes()
      await createMaterisls()
    });
    createUI()


    return scene;
  }
}