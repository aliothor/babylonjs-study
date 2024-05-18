import { ArcRotateCamera, ComputeShader, Engine, HemisphericLight, MeshBuilder, RawTexture, Scene, StandardMaterial, Texture, UniformBuffer, Vector3, WebGPUEngine } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";
import dat from "dat.gui";

export default class BlurComputeShader {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Blur Compute Shaders'
    this.CreateEngin().then((eng) => {
      this.engine = eng
      this.scene = this.CreateScene();
      this.engine.runRenderLoop(() => {
        this.scene.render();
      })
    })
  }

  async CreateEngin() : Promise<Engine> {
    const webGPUSupported = await WebGPUEngine.IsSupportedAsync
    if (webGPUSupported) {
      const engine = new WebGPUEngine(this.canvas)
      await engine.initAsync()
      return engine
    }
    return new Engine(this.canvas)
  }
  
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})
    ground.rotation.x = -Math.PI / 2

    if (!this.checkCompteShadersSupported(this.engine, scene)) {
      return scene
    }

    const src = new Texture('https://playground.babylonjs.com/textures/skybox3_nx.jpg', scene, true)

    src.onLoadObservable.add(() => {
      const blurCompute = new BlurComputeShaders(src)

      const mat = new StandardMaterial('mat')
      mat.emissiveTexture = blurCompute.destTexture
      mat.disableLighting = true
      ground.material = mat

      // gui
      const settings = {
        filterSize: 15,
        iteration: 1
      }

      const gui = this.getGUI()

      const updateSettins = () => {
        blurCompute.apply(settings.filterSize, settings.iteration)
      }

      gui.add(settings, 'filterSize', 1, 23).step(2).onChange(updateSettins)
      gui.add(settings, 'iteration', 1, 10).step(1).onChange(updateSettins)

      updateSettins()
    })
  
    return scene;
  }

  checkCompteShadersSupported(engine: Engine, scene: Scene) : boolean {
    const supportCS = engine.getCaps().supportComputeShaders
    if (supportCS) return true

    // text
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const txt = '浏览器目前不支持 WebGPU， 请在设置中打开功能！'

    const info = new TextBlock()
    info.text = txt
    info.width = '100%'
    info.paddingLeft = '5px'
    info.paddingRight = '5px'
    info.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    info.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    info.color = 'red'
    info.fontSize = '24px'
    info.fontStyle = 'bold'
    info.textWrapping = true
    adt.addControl(info)

    return false
  }

  getGUI(): dat.GUI {
    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    return gui
  }

}

class BlurComputeShaders {
  engine: Engine
  src: Texture
  tempTexture: Texture
  destTexture: Texture
  buffParams: UniformBuffer
  buffFlip0: UniformBuffer
  buffFlip1: UniformBuffer
  filterSize: number
  numIterations: number
  cs1: ComputeShader | undefined
  cs2: ComputeShader | undefined
  csIterations: ComputeShader[] = []

  constructor(src: Texture) {
    const srcWidth = src.getSize().width
    const srcHeight = src.getSize().height
    const scene = src.getScene()
    this.src = src
    this.engine = scene!.getEngine()

    this.tempTexture = RawTexture.CreateRGBAStorageTexture(null, srcWidth, srcHeight, scene, false, false)
    this.destTexture = RawTexture.CreateRGBAStorageTexture(null, srcWidth, srcHeight, scene, false, false)

    this.buffParams = new UniformBuffer(this.engine, undefined, undefined, 'buffParams')
    this.buffFlip0 = new UniformBuffer(this.engine, undefined, undefined, 'buffFlip0')
    this.buffFlip1 = new UniformBuffer(this.engine, undefined, undefined, 'buffFlip1')

    this.buffParams.addUniform('filterDim', 1)
    this.buffParams.addUniform('blockDim', 1)

    this.buffFlip0.updateInt('value', 0)
    this.buffFlip0.update()
    this.buffFlip1.updateInt('value', 1)
    this.buffFlip1.update()

    this.filterSize = 0
    this.numIterations = -1
  }

  apply(filterSize: number, numIterations: number) {
    if (this.numIterations != numIterations) {
      const options = {
        bindingsMapping: {
          'params': { group: 0, binding: 0 },
          'inputTex': { group: 0, binding: 2 },
          'outputTex': { group: 0, binding: 3 },
          'flip': { group: 0, binding: 4 }
        }
      }

      this.cs1 = new ComputeShader('cs1', this.engine, {
        computeSource: blurComputeShader
      }, options)
      this.cs1.setUniformBuffer('params', this.buffParams)
      this.cs1.setTexture('inputTex', this.src)
      this.cs1.setStorageTexture('outputTex', this.tempTexture)
      this.cs1.setUniformBuffer('flip', this.buffFlip0)

      this.cs2 = new ComputeShader('cs2', this.engine, {
        computeSource: blurComputeShader
      }, options)
      this.cs2.setUniformBuffer('params', this.buffParams)
      this.cs2.setTexture('inputTex', this.tempTexture)
      this.cs2.setStorageTexture('outputTex', this.destTexture)
      this.cs2.setUniformBuffer('flip', this.buffFlip1)

      this.csIterations = []
      for (let i = 0; i < numIterations - 1; ++i) {
        let cs = new ComputeShader('compute' + (i * 2 + 3), this.engine, {
          computeSource: blurComputeShader
        }, options)

        cs.setUniformBuffer('params', this.buffParams)
        cs.setTexture('inputTex', this.destTexture)
        cs.setStorageTexture('outputTex', this.tempTexture)
        cs.setUniformBuffer('flip', this.buffFlip0)

        this.csIterations.push(cs)

        cs = new ComputeShader('compute' + (i * 2 + 4), this.engine, {
          computeSource: blurComputeShader
        }, options)

        cs.setUniformBuffer('params', this.buffParams)
        cs.setTexture('inputTex', this.tempTexture)
        cs.setStorageTexture('outputTex', this.destTexture)
        cs.setUniformBuffer('flip', this.buffFlip1)

        this.csIterations.push(cs)
      }
    }

    let blockDim = tileDim - (filterSize - 1)

    this.buffParams.updateInt('filterDim', filterSize)
    this.buffParams.updateInt('blockDim', blockDim)
    this.buffParams.update()

    this.filterSize = filterSize
    this.numIterations = numIterations

    const srcWidth = this.src.getSize().width
    const srcHeight = this.src.getSize().height

    this.cs1?.dispatchWhenReady(Math.ceil(srcWidth / blockDim), Math.ceil(srcHeight / batch[1])).then(() => {
      this.cs2?.dispatch(Math.ceil(srcHeight / blockDim), Math.ceil(srcWidth / batch[1]))
      let d0 = srcWidth
      let d1 = srcHeight
      for (let i = 0; i < numIterations - 1; ++i) {
        this.csIterations[i].dispatch(Math.ceil(d0 / blockDim), Math.ceil(d1 / batch[1]))
        const d = d0
        d0 = d1
        d1 = d
      }
    })
  }
}

const tileDim = 128;
const batch = [4, 4];

const blurComputeShader = /* wgsl */ `
  struct Params {
    filterDim : u32,
    blockDim : u32,
  };

  @group(0) @binding(0) var<uniform> params : Params;
  @group(0) @binding(1) var samp : sampler;
  @group(0) @binding(2) var inputTex : texture_2d<f32>;
  @group(0) @binding(3) var outputTex : texture_storage_2d<rgba8unorm,write>;

  struct Flip {
    value : u32,
  };
  @group(0) @binding(4) var<uniform> flip : Flip;

  var<workgroup> tile : array<array<vec3<f32>, ${tileDim}>, ${batch[1]}>;

  @compute @workgroup_size(${tileDim / batch[0]}, 1, 1)
  fn main(
    @builtin(workgroup_id) WorkGroupID : vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID : vec3<u32>
  ) {
    let filterOffset : u32 = (params.filterDim - 1u) / 2u;
    let dims : vec2<u32> = textureDimensions(inputTex, 0);

    let baseIndex : vec2<u32> = vec2<u32>(
      WorkGroupID.xy * vec2<u32>(params.blockDim, ${batch[1]}u) +
      LocalInvocationID.xy * vec2<u32>(${batch[0]}u, 1u)
    ) - vec2<u32>(u32(filterOffset), 0);

    for (var r : u32 = 0u; r < ${batch[1]}u; r = r + 1u) {
      for (var c : u32 = 0u; c < ${batch[0]}u; c = c + 1u) {
        var loadIndex : vec2<u32> = baseIndex + vec2<u32>(c, r);
        if (flip.value != 0u) {
          loadIndex = loadIndex.yx;
        }

        tile[r][${batch[0]}u * LocalInvocationID.x + c] =
          textureSampleLevel(inputTex, samp,
            (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 0.0).rgb;
      }
    }

    workgroupBarrier();

    for (var r : u32 = 0u; r < ${batch[1]}u; r = r + 1u) {
      for (var c : u32 = 0u; c < ${batch[0]}u; c = c + 1u) {
        var writeIndex : vec2<u32> = baseIndex + vec2<u32>(c, r);
        if (flip.value != 0u) {
          writeIndex = writeIndex.yx;
        }

        let center : u32 = ${batch[0]}u * LocalInvocationID.x + c;
        if (center >= filterOffset &&
            center < ${tileDim}u - filterOffset &&
            all(writeIndex < dims)) {
          var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
          for (var f : u32 = 0u; f < params.filterDim; f = f + 1u) {
            var i : u32 = center + f - filterOffset;
            acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];
          }
          textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));
        }
      }
    }
  }
`
