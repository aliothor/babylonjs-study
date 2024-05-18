import { ArcRotateCamera, DirectionalLight, Engine, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3, Color3, SpotLight, Texture, ShadowGenerator } from "babylonjs";

export default class ShadowExample {
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

    const camera = new ArcRotateCamera('camera', 0, Math.PI / 3.5, 90, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = 0.1
    camera.upperBetaLimit = (Math.PI / 2) * 0.9
    camera.lowerRadiusLimit = 30
    camera.upperRadiusLimit = 150

    // directional
    const light = new DirectionalLight('light', new Vector3(-1, -2, -1), scene);
    light.position = new Vector3(20, 40, 20)
    light.intensity = 0.5

    const lightSphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 10})
    lightSphere.position = light.position
    const lightSphereMat = new StandardMaterial('lightMat')
    lightSphereMat.emissiveColor = new Color3(1, 1, 0)
    lightSphere.material = lightSphereMat

    // spotlight
    const light2 = new SpotLight('spot', new Vector3(30, 40, 20), new Vector3(-1, -2, -1), 1.1, 16, scene)
    light2.intensity = 0.5

    const lightSphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 2, segments: 10})
    lightSphere2.position = light2.position
    lightSphere2.material = lightSphereMat

    // ground
    const url = 'https://playground.babylonjs.com/textures/'
    const ground = MeshBuilder.CreateGroundFromHeightMap(
      'ground',
      `${url}heightMap.png`,
      {width: 100, height: 100, subdivisions: 100, minHeight: 0, maxHeight: 10},
    )
    const gMat = new StandardMaterial('ground')
    const texture = new Texture(`${url}ground.jpg`)
    texture.uScale = 6
    texture.vScale = 6
    gMat.diffuseTexture = texture
    gMat.specularColor = new Color3(0, 0, 0)
    ground.position.y = -2.05
    ground.material = gMat
    ground.receiveShadows = true

    // Torus
    const torus = MeshBuilder.CreateTorus('torus', {diameter: 4, thickness: 2, tessellation: 30})
    // box
    const box = MeshBuilder.CreateBox('box', {size: 3})
    box.parent = torus

    // shadow
    const shadowGen = new ShadowGenerator(1024, light)
    shadowGen.addShadowCaster(torus)
    shadowGen.useExponentialShadowMap = true

    const shadowGen2 = new ShadowGenerator(1024, light2)
    shadowGen2.addShadowCaster(torus)
    shadowGen2.usePoissonSampling = true

    // animations
    let alpha = 0
    scene.registerBeforeRender(() => {
      torus.rotation.x += 0.01
      torus.rotation.z += 0.02
      torus.position = new Vector3(Math.cos(alpha) * 30, 10, Math.sin(alpha) * 30)
      alpha += 0.01
    })

    return scene;
  }
}