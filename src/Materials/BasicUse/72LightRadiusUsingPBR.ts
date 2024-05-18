import { ArcRotateCamera, Color3, Engine, HDRCubeTexture, HemisphericLight, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, Texture, Vector3 } from "babylonjs";

export default class LightRadiusUsingPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Light Radius Using PBR'
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

    const light = new PointLight('light', new Vector3(0, 85, 0), scene);
    light.intensity = 100
    light.radius = 15

    // environment texture
    const hdrTex = new HDRCubeTexture('https://playground.babylonjs.com/textures/room.hdr', scene, 512)

    // skybox
    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000});
    const skyMat = new PBRMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = hdrTex.clone()
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.microSurface = 1
    skyMat.cameraExposure = 0.66
    skyMat.cameraContrast = 1.66
    skyMat.disableLighting = true
    skybox.material = skyMat
    skybox.infiniteDistance = true

    // mesh
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 80, segments: 48})

    // material
    const glass = new PBRMaterial('glass')
    glass.reflectionTexture = hdrTex
    glass.refractionTexture = hdrTex
    glass.linkRefractionWithTransparency = true
    glass.directIntensity = 1
    glass.environmentIntensity = 0.1
    glass.microSurface = 1
    glass.cameraExposure = 0.66
    glass.cameraContrast = 1.66
    glass.reflectivityColor = new Color3(0.2, 0.2, 0.2)
    glass.albedoColor = new Color3(0.95, 0.95, 0.95)
    sphere.material = glass

    return scene;
  }
}