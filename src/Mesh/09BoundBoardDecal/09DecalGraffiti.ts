import { ArcRotateCamera, AssetsManager, Color4, CubeTexture, Engine, HemisphericLight, Mesh, MeshBuilder, MeshUVSpaceRenderer, Nullable, RenderTargetTexture, Scene, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class DecalGraffiti {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Decal Graffiti'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1
    camera.lowerRadiusLimit = 2
    camera.upperRadiusLimit = 7

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // environment
    scene.clearColor = Color4.FromHexString('#3b362aff')
    const env = CubeTexture.CreateFromPrefilteredData('https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/env/studio.env', scene)
    env.name = 'studioIBL'
    env.gammaSpace = false
    env.rotationY = 1.9
    scene.environmentTexture = env
    scene.environmentIntensity = 1

    // load mesh
    const manager = new AssetsManager()
    const taskBrickSphere = manager.addMeshTask('brickSphere', '', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/gltf/', 'brickSphere.glb')
    const taskGraffities = []
    taskGraffities[0] = manager.addTextureTask('graffiti_00', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_B.png')
    taskGraffities[1] = manager.addTextureTask('graffiti_01', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot01.png')
    taskGraffities[2] = manager.addTextureTask('graffiti_02', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot02.png')
    taskGraffities[3] = manager.addTextureTask('graffiti_03', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot03.png')
    taskGraffities[4] = manager.addTextureTask('graffiti_04', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot04.png')
    taskGraffities[5] = manager.addTextureTask('graffiti_05', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot05.png')
    taskGraffities[6] = manager.addTextureTask('graffiti_06', 'https://patrickryanms.github.io/BabylonJStextures/Demos/textureDecals/assets/textures/tag_dot06.png')

    manager.load()
    manager.onTaskErrorObservable.add((task) => {
      console.error('Error loading task: ' + task.name)
      console.error(task.errorObject.message, task.errorObject.exception)
    })

    let brickSphere: Nullable<Mesh> = null
    manager.onFinish = (task) => {
      const root = taskBrickSphere.loadedMeshes[0]
      for (let mesh of root.getChildren(undefined, false)) {
        if (mesh.name == 'brickSphere') {
          brickSphere = mesh as Mesh
        }
      }
    }
    
    const rtt = new RenderTargetTexture('decalRTT', {width: 2048, height: 2048})

    if (brickSphere && brickSphere.getTotalVertices() > 0 && brickSphere.material && brickSphere.material.decalMap) {
      brickSphere.decalMap = new MeshUVSpaceRenderer(brickSphere, scene, {width: 4096, height: 4096})
      brickSphere.material.decalMap.smoothAlpha = true
      brickSphere.material.decalMap.isEnabled = true
    }

    const decalTex = []
    taskGraffities.forEach(tex => {
      decalTex.push(tex.texture)
    })

    const decal = {
      tagSize: new Vector3(0.9, 0.9, 0.9),
      dotSize: new Vector3(0.6, 1.2, 1.2),
      current: 0,
      angle: 0,
      angleScale: 0.5,
      mesh: undefined,
      projector: undefined
    };

    const gbr = scene.enableGeometryBufferRenderer()
    gbr!.enablePosition = true
    const getPositionAtMouseLocation = () => {
      return new Promise((resolve) => {
        const texturePos = gbr?.getGBuffer().textures[2]
        texturePos?.readPixels(-1, 0, null, true, false, scene.pointerX, this.engine.getRenderHeight() - scene.pointerY, 1, 1)?.then(buffer => {
          const p = Vector3.FromArray(buffer)
          resolve(p.x == 0 && p.y == 0 && p.z == 0 && buffer[3] == 0 ? null : p)
        })
      })
    }

    return scene;
  }
}