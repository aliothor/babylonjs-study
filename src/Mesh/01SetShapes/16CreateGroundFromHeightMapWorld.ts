import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class CreateGroundFromHeightMapWorld {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Ground From HeightMap(world)'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = 0.1
    camera.upperBetaLimit = (Math.PI / 2) * 0.9
    camera.lowerRadiusLimit = 30
    camera.upperRadiusLimit = 150

    const spot = new PointLight('light', new Vector3(0, 30, 10), scene);
    spot.diffuse = new Color3(1, 1, 1)
    spot.specular = new Color3(0, 0, 0)

    const ground = MeshBuilder.CreateGroundFromHeightMap('ground', 'https://playground.babylonjs.com/textures/worldHeightMap.jpg', {
      width: 200,
      height: 200,
      subdivisions: 250,
      maxHeight: 10
    })
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/earth.jpg')
    ground.material = mat

    // skybox
    const skybox = MeshBuilder.CreateBox('skybox', {size: 800})
    const skyMat = new StandardMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skyMat.disableLighting = true
    skybox.material = skyMat

    // sun
    const sun = MeshBuilder.CreateSphere('sun', {diameter: 4, segments: 10})
    const sunMat = new StandardMaterial('sunMat')
    sunMat.emissiveColor = new Color3(1, 1, 0)
    sun.material = sunMat

    // sun animation
    scene.onBeforeRenderObservable.add(() => {
      sun.position = spot.position
      spot.position.x -= 0.5
      if (spot.position.x < -90) {
        spot.position.x = 100
      }
    })

    return scene;
  }
}