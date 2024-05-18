import { ArcRotateCamera, Color3, CubeTexture, Engine, EquiRectangularCubeTexture, HemisphericLight, MeshBuilder, PBRMaterial, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class SpheresReflectingEquirectangularSkybox {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Spheres Reflecting Equirectangular Skybox'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const url = 'https://playground.babylonjs.com/textures/'
    // environment texture
    const eqTex = new EquiRectangularCubeTexture(`${url}equirectangular.jpg`, scene, 512)
    scene.imageProcessingConfiguration.exposure = 1
    scene.imageProcessingConfiguration.contrast = 2

    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000});
    const skyMat = new PBRMaterial('skyMat');
    skyMat.backFaceCulling = false;
    skyMat.reflectionTexture = eqTex.clone()
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMat.microSurface = 1
    skyMat.disableLighting = false
    skybox.material = skyMat;
    skybox.infiniteDistance = true

    // meshes
    const sGlass = MeshBuilder.CreateSphere('sGlass', {diameter: 30, segments: 48})
    sGlass.translate(new Vector3(1, 0, 0), -60)

    const sMetal = MeshBuilder.CreateSphere('sMetal', {diameter: 30, segments: 48})
    sMetal.translate(new Vector3(1, 0, 0), 60)

    const sPlastic = MeshBuilder.CreateSphere('sPlastic', {diameter: 30, segments: 48})
    sPlastic.translate(new Vector3(0, 0, 1), -60)

    const woodPlane = MeshBuilder.CreateBox('woodPlane', {width: 65, height: 1, depth: 65})

    // materials
    const glass = new PBRMaterial('glass')
    glass.reflectionTexture = eqTex
    glass.refractionTexture = eqTex
    glass.linkRefractionWithTransparency = true
    glass.indexOfRefraction = 0.52
    glass.alpha = 0
    glass.microSurface = 1
    glass.reflectivityColor = new Color3(0.2, 0.2, 0.2)
    glass.albedoColor = new Color3(0.85, 0.85, 0.85)
    sGlass.material = glass

    const metal = new PBRMaterial('metal')
    metal.reflectionTexture = eqTex
    metal.microSurface = 0.96
    metal.reflectivityColor = new Color3(0.85, 0.85, 0.85)
    metal.albedoColor = new Color3(0.01, 0.01, 0.01)
    sMetal.material = metal

    const plastic = new PBRMaterial('plastic')
    plastic.reflectionTexture = eqTex
    plastic.microSurface = 0.96
    plastic.albedoColor = new Color3(0.206, 0.94, 1)
    plastic.reflectivityColor = new Color3(0.003, 0.003, 0.003)
    sPlastic.material = plastic

    const wood = new PBRMaterial('wood')
    wood.reflectionTexture = eqTex
    wood.environmentIntensity = 1
    wood.specularIntensity = 0.3
    wood.reflectivityTexture = new Texture(`${url}reflectivity.png`)
    wood.useMicroSurfaceFromReflectivityMapAlpha = true
    wood.albedoColor = Color3.White()
    wood.albedoTexture = new Texture(`${url}albedo.png`)
    woodPlane.material = wood

    return scene;
  }
}