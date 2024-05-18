import { AbstractMesh, ArcRotateCamera, AssetsManager, Color3, Color4, CubeTexture, DirectionalLight, Engine, Mesh, PBRMaterial, Scene, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class SpecularReflectionsUsingPBRMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Specular Reflections Using PBRMaterial'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = Color4.FromInts(20, 20, 25, 255)

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1
    camera.wheelDeltaPercentage = 0.1

    const dirLight = new DirectionalLight('dirLight', new Vector3(0.45, -0.34, -0.83), scene)
    dirLight.position = new Vector3(0, 3, 5)
    dirLight.shadowMinZ = 3.5
    dirLight.shadowMaxZ = 12

    // add in IBL
    const cubeTex = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/Studio_Softbox_2Umbrellas_cube_specular.env', scene)
    cubeTex.name = 'studioIBL'
    cubeTex.gammaSpace = false
    cubeTex.rotationY = 1.9
    scene.environmentTexture = cubeTex
    scene.environmentIntensity = 1

    // assets
    const server = 'https://assets.babylonjs.com/'
    const manager = new AssetsManager()
    // mesh
    const shaderBallGroup = manager.addMeshTask('load shaderBall group', '', server + 'meshes/Demos/pbr_mr_specular/', 'shaderBall_rotation.glb')
    // texture
    const reflectanceTex = manager.addTextureTask('load reflectance texture', server + 'meshes/Demos/pbr_mr_specular/reflectanceColorTex.png', false, false, Texture.NEAREST_NEAREST)
    const metallicReflectanceTex = manager.addTextureTask('load reflectance texture', server + 'meshes/Demos/pbr_mr_specular/metallicReflectanceTex.png', false, false, Texture.NEAREST_NEAREST)

    manager.load()
    manager.onTaskErrorObservable.add(function(task) {
      console.log('error on task: ' + task.name);
      console.log(task.errorObject.message, task.errorObject.exception);
    })

    const assets = {
      shaderBallUpperMesh: new AbstractMesh(''),
      shaderBallMiddleMesh: new AbstractMesh(''),
      shaderBallLowerMesh: new AbstractMesh('')
    }
    manager.onFinish = (tasks) => {
      console.log('all tasks finished.', tasks);
      
      // mesh
      const shaderBallMiddleRoot = shaderBallGroup.loadedMeshes[0]
      shaderBallMiddleRoot.name = 'shaderBallMiddleRoot'
      assets.shaderBallMiddleMesh = shaderBallMiddleRoot.getChildMeshes()[0]
      assets.shaderBallMiddleMesh.material?.dispose()

      const shaderBallUpperRoot = shaderBallMiddleRoot.clone('shaderBallUpperRoot', null)
      assets.shaderBallUpperMesh = shaderBallUpperRoot!.getChildMeshes()[0]
      shaderBallUpperRoot!.position.y = 3

      const shaderBallLowerRoot = shaderBallMiddleRoot.clone('shaderBallLowerRoot', null)
      assets.shaderBallLowerMesh = shaderBallLowerRoot!.getChildMeshes()[0]
      shaderBallLowerRoot!.position.y = -3

      createMaterials()
    }

    function createMaterials() {
      const shaderBallUpper = new PBRMaterial('shaderBallUpper')
      shaderBallUpper.albedoColor = Color3.FromInts(50, 50, 50).toLinearSpace()
      shaderBallUpper.metallic = 0
      shaderBallUpper.roughness = 0.15
      shaderBallUpper.metallicF0Factor = 0.95
      shaderBallUpper.metallicReflectanceColor = Color3.FromInts(255, 250, 250).toLinearSpace()
      shaderBallUpper.metallicReflectanceTexture = metallicReflectanceTex.texture

      const shaderBallMiddle = new PBRMaterial('shaderBallMiddle')
      shaderBallMiddle.albedoColor = Color3.FromInts(50, 50, 50).toLinearSpace()
      shaderBallMiddle.metallic = 0
      shaderBallMiddle.roughness = 0.15
      shaderBallMiddle.metallicF0Factor = 0.95
      shaderBallMiddle.metallicReflectanceColor = Color3.FromInts(255, 250, 250).toLinearSpace()
      shaderBallMiddle.reflectanceTexture = reflectanceTex.texture

      const shaderBallLower = new PBRMaterial('shaderBallLower')
      shaderBallLower.albedoColor = Color3.FromInts(50, 50, 50).toLinearSpace()
      shaderBallLower.metallic = 0
      shaderBallLower.roughness = 0.15
      shaderBallLower.metallicF0Factor = 0.95
      shaderBallLower.metallicReflectanceColor = Color3.FromInts(255, 250, 250).toLinearSpace()
      shaderBallLower.metallicReflectanceTexture = metallicReflectanceTex.texture
      shaderBallLower.reflectanceTexture = reflectanceTex.texture
      shaderBallLower.useOnlyMetallicFromMetallicReflectanceTexture = true


      // asign material to mesh
      assets.shaderBallUpperMesh.material = shaderBallUpper
      assets.shaderBallMiddleMesh.material = shaderBallMiddle
      assets.shaderBallLowerMesh.material = shaderBallLower
    }

    return scene;
  }
}