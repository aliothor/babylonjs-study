import { ArcRotateCamera, Color3, CubeTexture, Engine, FresnelParameters, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class FresnelReflection {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fresnel Reflection'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const url = 'https://playground.babylonjs.com/textures/TropicalSunnyDay'
    // skybox
    const skybox = MeshBuilder.CreateBox('skybox', {size: 100});
    const skyMat = new StandardMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture(url, scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skyMat.disableLighting = true
    skybox.material = skyMat

    // meshes
    const sphere1 = MeshBuilder.CreateSphere('sphere1', {diameter: 3, segments: 32})
    const sphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 3, segments: 32})
    const sphere3 = MeshBuilder.CreateSphere('sphere3', {diameter: 3, segments: 32})
    const sphere4 = MeshBuilder.CreateSphere('sphere4', {diameter: 3, segments: 32})
    const sphere5 = MeshBuilder.CreateSphere('sphere5', {diameter: 3, segments: 32})

    sphere2.position.z -= 5
    sphere3.position.z += 5
    sphere4.position.x += 5
    sphere5.position.x -= 5

    // materials
    let mat = new StandardMaterial('mat1')

    // sphere1
    mat.reflectionTexture = new CubeTexture(url, scene)
    mat.diffuseColor = new Color3(0, 0, 0)
    mat.emissiveColor = new Color3(0.5, 0.5, 0.5)
    mat.alpha = 0.2
    mat.specularPower = 16

    mat.reflectionFresnelParameters = new FresnelParameters()
    mat.reflectionFresnelParameters.bias = 0.1

    mat.emissiveFresnelParameters = new FresnelParameters()
    mat.emissiveFresnelParameters.bias = 0.6
    mat.emissiveFresnelParameters.power = 4
    mat.emissiveFresnelParameters.leftColor = Color3.White()
    mat.emissiveFresnelParameters.rightColor = Color3.Black()

    mat.opacityFresnelParameters = new FresnelParameters()
    mat.opacityFresnelParameters.leftColor = Color3.White()
    mat.opacityFresnelParameters.rightColor = Color3.Black()

    sphere1.material = mat

    // sphere2
    mat = new StandardMaterial('mat2')
    mat.reflectionTexture = new CubeTexture(url, scene)
    mat.diffuseColor = new Color3(0, 0, 0)
    mat.emissiveColor = new Color3(0.5, 0.5, 0.5)
    mat.specularPower = 32

    mat.reflectionFresnelParameters = new FresnelParameters()
    mat.reflectionFresnelParameters.bias = 0.1

    mat.emissiveFresnelParameters = new FresnelParameters()
    mat.emissiveFresnelParameters.bias = 0.5
    mat.emissiveFresnelParameters.power = 4
    mat.emissiveFresnelParameters.leftColor = Color3.White()
    mat.emissiveFresnelParameters.rightColor = Color3.Black()

    sphere2.material = mat

    // sphere3
    mat = new StandardMaterial('mat3')
    mat.reflectionTexture = new CubeTexture(url, scene)
    mat.diffuseColor = new Color3(0, 0, 0)
    mat.emissiveColor = Color3.White()
    mat.alpha = 0.2
    mat.specularPower = 64

    mat.emissiveFresnelParameters = new FresnelParameters()
    mat.emissiveFresnelParameters.bias = 0.2
    mat.emissiveFresnelParameters.leftColor = Color3.White()
    mat.emissiveFresnelParameters.rightColor = Color3.Black()

    mat.opacityFresnelParameters = new FresnelParameters()
    mat.opacityFresnelParameters.power = 4
    mat.opacityFresnelParameters.leftColor = Color3.White()
    mat.opacityFresnelParameters.rightColor = Color3.Black()

    sphere3.material = mat

    // sphere4
    mat = new StandardMaterial('mat4')
    mat.diffuseColor = new Color3(0, 0, 0)
    mat.emissiveColor = Color3.White()
    mat.specularPower = 64

    mat.emissiveFresnelParameters = new FresnelParameters()
    mat.emissiveFresnelParameters.bias = 0.5
    mat.emissiveFresnelParameters.power = 4
    mat.emissiveFresnelParameters.leftColor = Color3.White()
    mat.emissiveFresnelParameters.rightColor = Color3.Black()

    sphere4.material = mat

    // sphere5
    mat = new StandardMaterial('mat5')
    mat.reflectionTexture = new CubeTexture(url, scene)
    mat.reflectionTexture.level = 0.5
    mat.diffuseColor = new Color3(0, 0, 0)
    mat.emissiveColor = new Color3(0.2, 0.2, 0.2)
    mat.specularPower = 64

    mat.emissiveFresnelParameters = new FresnelParameters()
    mat.emissiveFresnelParameters.bias = 0.4
    mat.emissiveFresnelParameters.power = 2
    mat.emissiveFresnelParameters.leftColor = Color3.White()
    mat.emissiveFresnelParameters.rightColor = Color3.Black()

    sphere5.material = mat


    return scene;
  }
}