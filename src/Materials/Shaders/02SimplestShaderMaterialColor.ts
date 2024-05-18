import { ArcRotateCamera, Color3, Effect, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShaderMaterial, Texture, Vector3 } from "babylonjs";

export default class SimplestShaderMaterialColor {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simplest Shader Material -- Color'
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
    light.intensity = 0.7

    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})

    Effect.ShadersStore['myVertexShader'] = `
      precision highp float;
      attribute vec3 position;
      uniform mat4 worldViewProjection;

      void main(void) {
        vec4 p = vec4(position, 1);
        gl_Position = worldViewProjection * p;
      }
    `

    Effect.ShadersStore['myFragmentShader'] = `
      precision highp float;
      uniform vec3 color;
      
      void main(void) {
        // gl_FragColor = vec4(1, 0, 0, 1);
        gl_FragColor = vec4(color, 1);
      }
    `

    const shaderMat = new ShaderMaterial('shader', scene, 'my', {
      attributes: ['position'],
      uniforms: ['worldViewProjection', 'color']
    })
    box.material = shaderMat

    // color
    const shaderColor = new Color3(0, 0, 0)
    shaderMat.setColor3('color', shaderColor)
    let speed = 0.001
    scene.onBeforeRenderObservable.add(() => {
      let t = Date.now() * speed
      shaderColor.r = Math.sin(t) * 0.5 + 0.5
      shaderMat.setColor3('color', shaderColor)
    })

    return scene;
  }
}