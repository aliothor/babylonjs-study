import { ArcRotateCamera, Color3, ComputeShader, Engine, HemisphericLight, MeshBuilder, RawTexture, Scene, StandardMaterial, StorageBuffer, Texture, UniformBuffer, Vector3, WebGPUEngine } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";

export default class SimpleComputeShaders {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simple Compute Shaders'
    this.CreateEngine().then((eng) => {
      this.engine = eng
      this.scene = this.CreateScene();
      this.engine.runRenderLoop(() => {
        this.scene.render();
      })
    })
  }

  async CreateEngine() : Promise<Engine> {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 32})
    sphere.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})

    if (!this.checkCompteShadersSupported(this.engine, scene)) {
      return scene
    }

    // compute 1
    const copyTextureComputeShader = /* wgsl */ `
      @group(0) @binding(0) var dest : texture_storage_2d<rgba8unorm,write>;
      @group(0) @binding(1) var samplerSrc : sampler;
      @group(0) @binding(2) var src : texture_2d<f32>;

      @compute @workgroup_size(1, 1, 1)

      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let dims : vec2<f32> = vec2<f32>(textureDimensions(src, 0));
        let pix : vec4<f32> = textureSampleLevel(src, samplerSrc, vec2<f32>(global_id.xy) / dims, 0.0);
        textureStore(dest, vec2<i32>(global_id.xy), pix);
      }
    `

    const cs1 = new ComputeShader('cs1', this.engine, {
      computeSource: copyTextureComputeShader
    }, {
      bindingsMapping: {
        'dest': { group: 0, binding: 0 },
        'src': { group: 0, binding: 2 }
      }
    })
    const src = new Texture('https://playground.babylonjs.com/textures/ground.jpg')
    const dest = RawTexture.CreateRGBAStorageTexture(null, 512, 512, scene, false, false)
    cs1.setTexture('src', src)
    cs1.setStorageTexture('dest', dest)

    cs1.dispatchWhenReady(dest.getSize().width, dest.getSize().height, 1).then(() => {
      dest.readPixels()?.then((data) => {
        // console.log(data);
      })
    })

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = dest
    ground.material = mat

    // compute 2
    const clearTextureComputeShader = /* wgsl */ `
      @group(0) @binding(0) var tbuf: texture_storage_2d<rgba8unorm,write>;

      struct Params {
        color: vec4<f32>
      };
      @group(0) @binding(1) var<uniform> params : Params;

      @compute @workgroup_size(1, 1, 1)

      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        textureStore(tbuf, vec2<i32>(global_id.xy), params.color);
      }
    `

    const cs2 = new ComputeShader('cs2', this.engine, {
      computeSource: clearTextureComputeShader
    }, {
      bindingsMapping: {
        'tbuf': { group: 0, binding: 0 },
        'params': { group: 0, binding: 1 }
      }
    })
    const dest2 = RawTexture.CreateRGBAStorageTexture(null, 512, 512, scene, false, false)
    const uBuffer = new UniformBuffer(this.engine)
    uBuffer.updateColor4('color', new Color3(1, 0.6, 0.8), 1)
    uBuffer.update()

    cs2.setStorageTexture('tbuf', dest2)
    cs2.setUniformBuffer('params', uBuffer)
    cs2.dispatchWhenReady(dest2.getSize().width, dest.getSize().height, 1)

    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseTexture = dest2
    sphere.material = mat2

    // compute 3
    const matrixMulComputeShader = /* wgsl */ `
      struct Matrix {
        size : vec2<f32>,
        numbers: array<f32>,
      };

      @group(0) @binding(0) var<storage,read_write> firstMatrix : Matrix;
      @group(0) @binding(1) var<storage,read_write> secondMatrix : Matrix;
      @group(0) @binding(2) var<storage,read_write> resultMatrix : Matrix;

      @compute @workgroup_size(1, 1, 1)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);

        let resultCell : vec2<u32> = vec2<u32>(global_id.x, global_id.y);
        var result : f32 = 0.0;
        for (var i : u32 = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
          let a : u32 = i + resultCell.x * u32(firstMatrix.size.y);
          let b : u32 = resultCell.y + i * u32(secondMatrix.size.y);
          result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
        }

        let index : u32 = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
        resultMatrix.numbers[index] = result;
      }
    `

    const cs3 = new ComputeShader("cs3", this.engine, { computeSource: matrixMulComputeShader }, { 
      bindingsMapping: {
        "firstMatrix": { group: 0, binding: 0 },
        "secondMatrix": { group: 0, binding: 1 },
        "resultMatrix": { group: 0, binding: 2 }
      }
    })

    const firstMatrix = new Float32Array([
      2 /* rows */, 4 /* columns */,
      1, 2, 3, 4,
      5, 6, 7, 8
    ])

    const bufferFirstMatrix = new StorageBuffer(this.engine, firstMatrix.byteLength)
    bufferFirstMatrix.update(firstMatrix)

    const secondMatrix = new Float32Array([
      4 /* rows */, 2 /* columns */,
      1, 2,
      3, 4,
      5, 6,
      7, 8
    ])

    const bufferSecondMatrix = new StorageBuffer(this.engine, secondMatrix.byteLength)
    bufferSecondMatrix.update(secondMatrix)

    const bufferResultMatrix = new StorageBuffer(this.engine, Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]))

    cs3.setStorageBuffer("firstMatrix", bufferFirstMatrix)
    cs3.setStorageBuffer("secondMatrix", bufferSecondMatrix)
    cs3.setStorageBuffer("resultMatrix", bufferResultMatrix)

    cs3.dispatchWhenReady(firstMatrix[0], secondMatrix[1]).then(() => {
      bufferResultMatrix.read().then((res) => {
        // we know the result buffer contains floats
        const resFloats = new Float32Array(res.buffer)
        console.log(resFloats)
      })
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

}