import { ArcRotateCamera, Color3, Color4, Effect, Engine, FragmentOutputBlock, HemisphericLight, InputBlock, MeshBuilder, NodeMaterial, NodeMaterialSystemValues, Scene, ShaderMaterial, TransformBlock, Vector2, Vector3, VertexOutputBlock } from "babylonjs";

export default class TestNode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'TestNode'
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

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    Effect.ShadersStore['myVertexShader'] = /* wgsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 worldViewProjection;

      varying vec2 v_uv;
      
      void main() {
        v_uv = uv;
        gl_Position = worldViewProjection * vec4(position, 1.0);
      }
    `

    Effect.ShadersStore['myFragmentShader'] = /* wgsl */ `
      precision highp float;
      uniform vec3 color;
      uniform vec2 resolution;

      varying vec2 v_uv;

      void main() {
        vec3 c = vec3(v_uv.x, v_uv.y, 0);
        gl_FragColor = vec4(c, 1.0);
      }
    `

    const shaderMat = new ShaderMaterial('shader', scene, 'my', {
      attributes: ['position', 'uv'],
      uniforms: ['worldViewProjection', 'color', 'resolution']
    })
    box.material = shaderMat

    const shaderColor = new Color3(0.5, 0.3, 0.8)
    shaderMat.setColor3('color', shaderColor)
    shaderMat.setVector2('resolution', new Vector2(this.canvas.width, this.canvas.height))    

    // const nodeMat = new NodeMaterial('nodeMat', scene, {
    //   emitComments: true
    // })
    // // nodeMat.setToDefault()
    
    // const posInput = new InputBlock('pos')
    // posInput.setAsAttribute('position')

    // const worldInput = new InputBlock('world')
    // worldInput.setAsSystemValue(NodeMaterialSystemValues.World)

    // const worldPos = new TransformBlock('worldPos')
    // posInput.connectTo(worldPos)
    // worldInput.connectTo(worldPos)

    // const viewProjInput = new InputBlock('viewProj')
    // viewProjInput.setAsSystemValue(NodeMaterialSystemValues.ViewProjection)

    // const worldPosMulbyViewProj = new TransformBlock('worldPos * viewProjTran')
    // worldPos.connectTo(worldPosMulbyViewProj)
    // viewProjInput.connectTo(worldPosMulbyViewProj)

    // const vertexOutput = new VertexOutputBlock('vertex')
    // worldPosMulbyViewProj.connectTo(vertexOutput)

    // // pixel
    // const pixColor = new InputBlock('color')
    // pixColor.value = new Color4(0.8, 0.8, 0.8, 1)

    // const fragOutput = new FragmentOutputBlock('frag')
    // pixColor.connectTo(fragOutput)

    // // add to nodes
    // nodeMat.addOutputNode(vertexOutput)
    // nodeMat.addOutputNode(fragOutput)

    // try {
    //   nodeMat.build()
    // } catch (err) {
    //   console.error(err);
    // }

    // box.material = nodeMat

    return scene;
  }
}