import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class UsingShaderFromCYOS {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Shader From CYOS'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');
    // 1
    // const mat = new StandardMaterial('mat')
    // mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    // box.material = mat

    // 2
    // Effect.ShadersStore['customVertexShader'] = `
    //   #version 300 es
    //   precision highp float;

    //   // Attributes
    //   in vec3 position;
    //   in vec2 uv;

    //   // Uniforms
    //   uniform mat4 worldViewProjection;

    //   // Varying
    //   out vec2 vUV;

    //   void main(void) {
    //       gl_Position = worldViewProjection * vec4(position, 1.0);

    //       vUV = uv;
    //   }
    // `

    // Effect.ShadersStore['customFragmentShader'] = `
    //   #version 300 es
    //   precision highp float;

    //   in vec2 vUV;

    //   uniform sampler2D textureSampler;

    //   out vec4 fragColor;

    //   void main(void) {
    //       fragColor = texture(textureSampler, vUV);
    //   }
    // `

    // const shaderMat = new ShaderMaterial('shader', scene, {
    //   vertex: 'custom',
    //   fragment: 'custom'
    // }, {
    //   attributes: ['position', 'normal', 'uv'],
    //   uniforms: ['world', 'worldView', 'worldViewProjection', 'view', 'projection']
    // })

    // const tex = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    // shaderMat.setTexture('textureSampler', tex)

    // box.material = shaderMat

    // 3
    // const url = 'https://cdn.rawgit.com/NasimiAsl/Extensions/master/Shaderbuilder/Babylonx.ShaderBuilder.js'
    const url = '/Materials/Babylonx.ShaderBuilder.js'
    const s = document.createElement('script')
    s.src = url
    document.head.appendChild(s)

    s.onload = function() {
      BABYLONX.ShaderBuilder.InitializeEngine()
      box.material = new BABYLONX.ShaderBuilder()
        .Map({ path: 'https://playground.babylonjs.com/textures/amiga.jpg' })
        .BuildMaterial(scene)
    }

    return scene;
  }
}