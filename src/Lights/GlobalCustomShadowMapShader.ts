import { ArcRotateCamera, Color3, DirectionalLight, Effect, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, SceneLoader, ShadowGenerator, StandardMaterial, Texture, Vector3 } from "babylonjs";

var shadowVS =
    `

#include<__decl__sceneVertex>
#include<__decl__meshVertex>

    // Attribute
attribute vec3 position;

uniform vec3 biasAndScaleSM;
uniform vec2 depthValuesSM;
uniform mat4 customWorld;

varying float vDepthMetric;

void main(void)
{
    vec4 worldPos = world * customWorld * vec4(position, 1.0);

    gl_Position = viewProjection * worldPos;

    vDepthMetric = ((gl_Position.z + depthValuesSM.x) / (depthValuesSM.y)) + biasAndScaleSM.x;
}
`;

var shadowFS =
    `
#ifndef SM_FLOAT
vec4 pack(float depth)
{
    const vec4 bit_shift = vec4(255.0 * 255.0 * 255.0, 255.0 * 255.0, 255.0, 1.0);
    const vec4 bit_mask = vec4(0.0, 1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0);

    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;

    return res;
}
#endif

varying float vDepthMetric;

uniform vec3 biasAndScaleSM;
uniform vec2 depthValuesSM;

void main(void)
{
    float depth = vDepthMetric;

#ifdef SM_ESM
    depth = clamp(exp(-min(87., biasAndScaleSM.z * depth)), 0., 1.);
#endif

#ifdef SM_FLOAT
    gl_FragColor = vec4(depth, 1.0, 1.0, 1.0);
#else
    gl_FragColor = pack(depth);
#endif
}    
`;


Effect.ShadersStore["customShadowMapVertexShader"] = shadowVS;
Effect.ShadersStore["customShadowMapFragmentShader"] = shadowFS;

export default class GlobalCustomShadowMapShader {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 0, 0.8, 90, new Vector3(0, 0, 0));
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(-1, -2, -1), scene);
    light.position = new Vector3(20, 40, 20)

    const box = MeshBuilder.CreateBox('box', {size: 5});

    // ground
    const url = 'https://playground.babylonjs.com/textures/'
    const ground = MeshBuilder.CreateGroundFromHeightMap('ground', `${url}heightMap.png`, {width: 100, height: 100, subdivisions: 100, minHeight: 0, maxHeight: 10, updatable: false})
    const gMat = new StandardMaterial('gMat')
    const texture = new Texture(`${url}ground.jpg`)
    texture.uScale = 6
    texture.vScale = 6
    gMat.diffuseTexture = texture
    gMat.specularColor = new Color3(0, 0, 0)
    ground.position.y = -10
    ground.material = gMat
    ground.receiveShadows = true

    // shadow
    const sg = new ShadowGenerator(1024, light)
    sg.customShaderOptions = {
      shaderName: 'customShadowMap',
      uniforms: ['customWorld']
    }
    sg.addShadowCaster(box)
    sg.useExponentialShadowMap = true

    let angle = 0
    sg.onBeforeShadowMapRenderObservable.add(effect => {
      effect.setMatrix('customWorld', Matrix.RotationY(angle))
      angle += 0.01
    })

    return scene;
  }
}