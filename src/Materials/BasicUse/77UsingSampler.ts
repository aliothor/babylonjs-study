import { AbstractMesh, ArcRotateCamera, Engine, HemisphericLight, Material, MaterialDefines, MaterialPluginBase, MeshBuilder, Nullable, RawTexture2DArray, Scene, StandardMaterial, SubMesh, Texture, UniformBuffer, Vector3 } from "babylonjs";

export default class UsingSampler {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Sampler'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const url = 'https://playground.babylonjs.com/textures/grass.png'
    const box = MeshBuilder.CreateBox('box');
    const mat = new StandardMaterial('mat')
    const tex = new Texture(url)
    mat.diffuseTexture = tex
    box.material = mat

    const box2 = MeshBuilder.CreateBox('box2')
    box2.position.copyFromFloats(-1, 0, -1.5)
    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseTexture = tex.clone()
    box2.material = mat2

    // texture 2D array
    const n_layers = 3
    const wh = 4
    const data = new Uint8Array(3 * wh * wh * n_layers)
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    for (let layer = 0; layer < n_layers; layer++) {
      for (let i = 0; i < 3 * wh * wh; i++) {
        let value = (i % 3 == layer) ? 0 : Math.round(rand(0.7, 0.9) * 255)
        data[layer * wh * wh * 3 + i] = value
      }
    }

    const texArray = new RawTexture2DArray(data, wh, wh, n_layers, Engine.TEXTUREFORMAT_RGB, scene, false, false, Texture.NEAREST_SAMPLINGMODE)

    // apply the plugin
    const testPlugin = new TestMaterialPlugin(box.material)
    testPlugin.texture = texArray
    testPlugin.textureIndex = 0
    testPlugin.isEnabled = true

    let t = 0
    scene.onBeforeRenderObservable.add(() => {
      testPlugin.textureIndex = Math.floor(t)
      t += 1 / 60
      t = t % n_layers
    })

    return scene;
  }
}

class TestMaterialPlugin extends MaterialPluginBase {
  textureIndex = 0
  texture: RawTexture2DArray | null = null
  _isEnabled = false

  get isEnabled() {
    return this._isEnabled
  }
  set isEnabled(enabled: boolean) {
    if (this._isEnabled == enabled) {
      return
    }
    this._isEnabled = enabled
    this.markAllDefinesAsDirty()
    this._enable(this._isEnabled)
  }

  constructor(material: Material) {
    super(material, 'TestPlugin', 200, {'TWOD_ARRAY_TEXTURE': false})
  }

  prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void {
    defines['TWOD_ARRAY_TEXTURE'] = this._isEnabled
  }

  getClassName(): string {
    return 'TestMaterialPlugin'
  }

  getSamplers(samplers: string[]): void {
    samplers.push('arrayTex')
  }

  getUniforms(): { ubo?: { name: string; size: number; type: string; }[] | undefined; vertex?: string | undefined; fragment?: string | undefined; } {
    return {
      ubo: [
        { name: 'texIndex', size: 1, type: 'float' }
      ],
      fragment: `
        #ifdef TWOD_ARRAY_TEXTURE
          uniform float texIndex;
        #endif
      `
    }
  }

  bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh): void {
    if (this._isEnabled) {
      uniformBuffer.updateFloat('texIndex', this.textureIndex)
      uniformBuffer.setTexture('arrayTex', this.texture)
    }
  }

  getCustomCode(shaderType: string): Nullable<{ [pointName: string]: string; }> {
    if (shaderType == 'fragment') return {
      '!baseColor\\=texture2D\\(diffuseSampler,vDiffuseUV\\+uvOffset\\);': `
        baseColor = texture(arrayTex, vec3(vDiffuseUV, texIndex));
      `,
      'CUSTOM_FRAGMENT_DEFINITIONS': `
        uniform highp sampler2DArray arrayTex;
      `
    }
    return null
  }

}