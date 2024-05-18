import { Color3, Constants, CubeTexture, Engine, ImageProcessingConfiguration, Matrix, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, Texture } from "babylonjs";
import 'babylonjs-loaders'

export default class SubSurfaceScatteringInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sub-Surface Scattering In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)
    scene.imageProcessingConfiguration.exposure = 1.6
    scene.imageProcessingConfiguration.toneMappingEnabled = true
    scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES

    scene.createDefaultCamera(true, true, true)
    scene.activeCamera!.alpha += Math.PI

    // skybox
    const hdrSkybox = MeshBuilder.CreateBox('hdrSkybox', {size: 5, updatable: false, sideOrientation: Constants.MATERIAL_CounterClockWiseSideOrientation})
    const hdrSkyboxMat = new PBRMaterial('hdrSkyboxMat')
    hdrSkyboxMat.backFaceCulling = false
    hdrSkyboxMat.reflectionTexture = scene.environmentTexture.clone()
    if (hdrSkyboxMat.reflectionTexture) {
      hdrSkyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    }
    hdrSkyboxMat.microSurface = 0.7
    hdrSkyboxMat.disableLighting = true
    hdrSkyboxMat.twoSidedLighting = true
    hdrSkybox.infiniteDistance = true
    hdrSkybox.material = hdrSkyboxMat

    // mesh light
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.005, segments: 32})
    const pbr = new PBRMaterial('metal')
    pbr.metallic = 0
    pbr.roughness = 1
    pbr.emissiveColor = new Color3(1, 1, 1)
    sphere.material = pbr
    sphere.setPivotMatrix(Matrix.Translation(0, 1 / 50, -4 / 20), false)

    const light = new PointLight('light', sphere.position, scene);
    light.diffuse = new Color3(1, 1, 1)
    light.specular = new Color3(1, 1, 1)
    light.intensity = 0.01

    const url = 'https://assets.babylonjs.com/meshes/Georgia-Tech-Dragon/'
    SceneLoader.Append(url, 'dragonUV.glb', scene, function(s) {
      const mat = s.getMeshById('dragonLR')?.material as PBRMaterial
      
      mat.metallic = 0
      mat.roughness = 0.16
      mat.albedoColor = Color3.FromHexString('#40F7E0').toLinearSpace()
      mat.subSurface.thicknessTexture = new Texture(url + 'thicknessMap.png', scene, false, false)
      mat.subSurface.maximumThickness = 2.2
      mat.subSurface.isTranslucencyEnabled = true
      mat.subSurface.isScatteringEnabled = true

      s.enableSubSurfaceForPrePass()!.metersPerUnit = 0.4
      s.prePassRenderer!.samples = 4

      s.registerAfterRender(() => {
        sphere.rotation.y += 0.01
        light.position = sphere.getAbsolutePosition()
      })
    })


    return scene;
  }
}