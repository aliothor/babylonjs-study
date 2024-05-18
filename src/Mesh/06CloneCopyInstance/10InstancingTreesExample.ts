import { Axis, Color3, Color4, CubeTexture, DirectionalLight, Engine, FreeCamera, Mesh, MeshBuilder, Scene, SceneLoader, ShadowGenerator, Space, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class InstancingTreesExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Instancing Trees Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new FreeCamera('camera', new Vector3(0, 10, -20))
    camera.speed = 0.4
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, -1, -0.3))
    light.position = new Vector3(20, 60, 30)

    // environment
    scene.ambientColor = Color3.FromInts(10, 30, 10)
    scene.clearColor = Color4.FromInts(127, 165, 13, 255)
    scene.gravity = new Vector3(0, -0.5, 0)

    // fog
    scene.fogMode = Scene.FOGMODE_EXP
    scene.fogDensity = 0.02
    scene.fogColor = Color3.FromInts(127, 165, 13)

    const url = 'https://playground.babylonjs.com/textures/'
    // skybox
    const skybox = MeshBuilder.CreateBox('skybox', {size: 150});
    const skyMat = new StandardMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture(url + 'skybox', scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skyMat.disableLighting = true
    skybox.material = skyMat
    skybox.infiniteDistance = true

    // invisible borders
    const border0 = MeshBuilder.CreateBox('border0')
    border0.scaling = new Vector3(1, 100, 100)
    border0.position.x = -50
    border0.checkCollisions = true
    border0.isVisible = false

    const border1 = MeshBuilder.CreateBox('border1')
    border1.scaling = new Vector3(1, 100, 100)
    border1.position.x = 50
    border1.checkCollisions = true
    border1.isVisible = false

    const border2 = MeshBuilder.CreateBox('border2')
    border2.scaling = new Vector3(100, 100, 1)
    border2.position.z = -50
    border2.checkCollisions = true
    border2.isVisible = false

    const border3 = MeshBuilder.CreateBox('border3')
    border3.scaling = new Vector3(100, 100, 1)
    border3.position.z = 50
    border3.checkCollisions = true
    border3.isVisible = false

    // ground
    const ground = MeshBuilder.CreateGroundFromHeightMap('ground', url + 'heightMap.png', {width: 100, height: 100, subdivisions: 100, minHeight: 0, maxHeight: 5, updatable: false})
    const gMat = new StandardMaterial('gMat')
    gMat.diffuseTexture = new Texture(url + 'ground.jpg')
    gMat.diffuseTexture.uScale = 6
    gMat.diffuseTexture.vScale = 6
    gMat.specularColor = new Color3(0, 0, 0)
    gMat.emissiveColor = new Color3(0.3, 0.3, 0.3)
    ground.material = gMat
    ground.receiveShadows = true
    ground.checkCollisions = true

    ground.onReady = function() {
      ground.optimize(100)
      // shadow
      const sg = new ShadowGenerator(1024, light)
      // trees
      SceneLoader.ImportMesh('', 'https://www.babylonjs.com/assets/Tree/', 'tree.babylon', scene, function(newMeshes) {
        const tree = newMeshes[0] as Mesh
        const rMat = tree.material as StandardMaterial
        rMat.opacityTexture = null
        rMat.backFaceCulling = false
        tree.isVisible = false
        tree.position.y = ground.getHeightAtCoordinates(0, 0)

        const range = 60
        const count = 100
        for (let i = 0; i < count; i++) {
          const inst = tree.createInstance('i' + i)

          const x = range / 2 - Math.random() * range
          const z = range / 2 - Math.random() * range
          const y = ground.getHeightAtCoordinates(x, z)
          inst.position = new Vector3(x, y, z)
          inst.rotate(Axis.Y, Math.random() * Math.PI *2, Space.WORLD)

          const scale = 0.5 + Math.random() * 2
          inst.scaling.addInPlace(new Vector3(scale, scale, scale))

          sg.addShadowCaster(inst)
        }
        sg.getShadowMap()!.refreshRate = 0
        sg.usePoissonSampling = true

        // collisions
        camera.checkCollisions = true
        camera.applyGravity = true
      })
    }


    return scene;
  }
}