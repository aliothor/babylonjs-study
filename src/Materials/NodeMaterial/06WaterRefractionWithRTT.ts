import { AbstractMesh, ArcRotateCamera, Color3, Color4, CubeTexture, DirectionalLight, Engine, NodeMaterial, NodeMaterialBlock, RenderTargetTexture, Scene, SceneLoader, ShadowGenerator, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class WaterRefractionWithRTT {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Water Refraction With RTT'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 1.0332, 0.9753, 0.1444, new Vector3(0.0, 0.015, 0.0));
    camera.attachControl(this.canvas, true);
    camera.wheelDeltaPercentage = 0.08
    camera.minZ = 0.001
    camera.lowerRadiusLimit = 0.1
    camera.upperRadiusLimit = 0.3
    camera.upperBetaLimit = 1.25

    const light = new DirectionalLight('light', new Vector3(0.45, -0.34, -0.83), scene);
    light.position = new Vector3(0, 0.1, 0.05)
    light.shadowMinZ = 0.01
    light.shadowMaxZ = 0.15
    light.intensity = 1

    scene.clearColor = Color4.FromInts(178, 178, 178, 255)
    const env = CubeTexture.CreateFromPrefilteredData('https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/env/kloofendal_pureSky.env', scene)
    env.name = 'sky'
    env.gammaSpace = false
    env.rotationY = 4.0823
    scene.environmentTexture = env

    const meshes = {
      pool: new AbstractMesh(''),
      groundTiles: new AbstractMesh(''),
      ground: new AbstractMesh(''),
      water: new AbstractMesh(''),
      waterRatio: 0
    }
    async function loadMeshes() {
      meshes.poolAsset = await SceneLoader.AppendAsync('https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/gltf/', 'pool.glb', scene)
      meshes.pool = scene.getMeshByName('pool_low')!
      meshes.groundTiles = scene.getMeshByName('groundTiles_low')!
      meshes.ground = scene.getMeshByName('ground_low')!
      meshes.water = scene.getMeshByName('waterSurface_low')!
      meshes.waterRatio = (meshes.water._boundingInfo.maximum.x - meshes.water._boundingInfo.minimum.x) / (meshes.water._boundingInfo.maximum.z - meshes.water._boundingInfo.minimum.z)

      light.includedOnlyMeshes.push(meshes.ground)
      light.includedOnlyMeshes.push(meshes.water)
    }

    NodeMaterial.IgnoreTexturesAtLoadTime = true
    const textures = {
      noise: new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/textures/noiseTextures_noise.png'),
      noiseNormal: new Texture('https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/textures/noiseTextures_normal.png')
    }
    const meshesMats = {
      water: new NodeMaterial(''),
      noiseTex: new NodeMaterialBlock(''),
      waterRatio: new NodeMaterialBlock(''),
      rtTex: new NodeMaterialBlock(''),
      noiseNormal: new NodeMaterialBlock(''),
      ground: new NodeMaterial(''),
      groundColor: new NodeMaterialBlock(''),
      shadowColor: new NodeMaterialBlock(''),
    }
    async function createMaterial() {
      meshesMats.water = await NodeMaterial.ParseFromFileAsync('waterNodeMat', 'https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/shaders/waterShader.json', scene)
      meshesMats.water.build(false)

      meshesMats.noiseTex = meshesMats.water.getBlockByName('noiseTex')!
      meshesMats.noiseTex.texture = textures.noise
      meshesMats.waterRatio = meshesMats.water.getBlockByName('waterRatio')!
      meshesMats.waterRatio.value = meshes.waterRatio
      meshesMats.rtTex = meshesMats.water.getBlockByName('rtTex')!
      meshesMats.noiseNormal = meshesMats.water.getBlockByName('noiseNormalTex')!
      meshesMats.noiseNormal.texture = textures.noiseNormal
      meshes.water.material?.dispose()
      meshes.water.material = meshesMats.water

      meshesMats.ground = await NodeMaterial.ParseFromFileAsync('groundNodeMat', 'https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/shaders/groundShader.json', scene)
      meshesMats.ground.build(false)

      meshesMats.groundColor = meshesMats.ground.getBlockByName('groundColor')!
      meshesMats.groundColor.value = Color3.FromInts(178, 178, 178)
      meshesMats.shadowColor = meshesMats.ground.getBlockByName('shadowColor')!
      meshesMats.shadowColor.value = Color3.FromInts(125, 125, 125)

      meshes.ground.material = meshesMats.ground
    }

    // shadows
    function generateShadows() {
      const sg = new ShadowGenerator(512, light)
      sg.useContactHardeningShadow = true
      sg.contactHardeningLightSizeUVRatio = 0.07

      sg.addShadowCaster(meshes.groundTiles)
      meshes.ground.receiveShadows = true
    }

    const createRTT = () => {
      const tex = new RenderTargetTexture('waterRefraction', {ratio: this.engine.getRenderWidth() / this.engine.getRenderHeight()}, scene)
      scene.customRenderTargets.push(tex)
      tex.renderList?.push(meshes.pool)
      tex.renderList?.push(meshes.ground)

      meshesMats.rtTex.texture = tex
    }

    setTimeout(async () => {
      await loadMeshes()
      await createMaterial()
      generateShadows()
      createRTT()
    });

    return scene;
  }
}