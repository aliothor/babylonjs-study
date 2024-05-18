import { ArcRotateCamera, Color3, Effect, Engine, HemisphericLight, MeshBuilder, Scene, ShaderMaterial, Vector3 } from "babylonjs";

Effect.ShadersStore['myshaderVertexShader'] = `
  attribute vec3 position;
  uniform mat4 world;
  uniform mat4 view;
  uniform mat4 viewProjection;
  varying float fFogDistance;

  void main(void) {
    vec4 worldPosition = world * vec4(position, 1.0);
    fFogDistance = (view * worldPosition).z;
    gl_Position = viewProjection * worldPosition;
  }
`

Effect.ShadersStore['myshaderFragmentShader'] = `
  #define FOGMODE_NONE 0.
  #define FOGMODE_EXP 1.
  #define FOGMODE_EXP2 2.
  #define FOGMODE_LINEAR 3.
  #define E 2.71828

  uniform vec4 vFogInfos;
  uniform vec3 vFogColor;
  varying float fFogDistance;

  float CalcFogFactor() {
    float fogCoeff = 1.0;
    float fogStart = vFogInfos.y;
    float fogEnd = vFogInfos.z;
    float fogDensity = vFogInfos.w;

    if (FOGMODE_LINEAR == vFogInfos.x) {
      fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
    } else if (FOGMODE_EXP == vFogInfos.x) {
      fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
    } else if (FOGMODE_EXP2 == vFogInfos.x) {
      fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
    }

    return clamp(fogCoeff, 0.0, 1.0);
  }

  void main(void) {
    float fog = CalcFogFactor();
    vec3 color = vec3(1.0, 0., 1.0);
    color = fog * color + (1.0 - fog) * vFogColor;
    gl_FragColor = vec4(color, 1.0);
  }
`

export default class FogAndShaderMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fog And Shader Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');
    const mat = new ShaderMaterial('shader', scene, {
      vertex: 'myshader',
      fragment: 'myshader'
    }, {
      needAlphaBlending: true,
      attributes: ['position'],
      uniforms: ['world', 'view', 'viewProjection', 'vFogInfos', 'fFogColor']
    })
    box.material = mat

    scene.fogMode = Scene.FOGMODE_LINEAR
    scene.fogStart = 0
    scene.fogEnd = 10
    scene.fogColor = Color3.FromHexString(scene.clearColor.toHexString(true))
    mat.onBind = function(mesh) {
      var effect = mat.getEffect()
      effect.setFloat4('vFogInfos', scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)
      effect.setColor3('vFogColor', scene.fogColor)
    }

    return scene;
  }
}