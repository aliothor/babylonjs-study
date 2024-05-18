import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, MeshUVSpaceRenderer, PointerEventTypes, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class DecalMaps {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Decal Maps'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 1.3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1
    camera.wheelPrecision = 100

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene);

    const showAlien = true

    let decalSize = Vector3.One()
    const inputUrl = 'https://playground.babylonjs.com/'
    if (showAlien) {
      await SceneLoader.ImportMeshAsync('', inputUrl + 'scenes/Alien/', 'Alien.gltf')
      decalSize = new Vector3(0.25 * 0.2, 0.25 * 0.2, 1 * 0.2)
      camera.target.y = -0.25
    } else {
      const sphere = MeshBuilder.CreateSphere('sphere')
      const sMat = new StandardMaterial('sMat')
      sMat.diffuseTexture = new Texture(inputUrl + 'textures/ground.jpg')
      sphere.material = sMat
      decalSize = new Vector3(0.25 * 0.4, 0.25 * 0.4, 1 * 0.4)
    }

    scene.meshes.forEach((mesh) => {
      if (mesh.getTotalVertices() > 0 && mesh.material && mesh.material.decalMap) {
        mesh.decalMap = new MeshUVSpaceRenderer(mesh, scene)
        mesh.material.decalMap.smoothAlpha = true
        mesh.material.decalMap.isEnabled = true
        mesh.decalMap.isReady()
      }
    })

    const texUrl = 'https://popov72.github.io/BabylonDev/resources/texture/'
    const decals = [
      new Texture(texUrl + 'bulletHole1.png'),
      new Texture(texUrl + 'bulletHole2.png'),
      new Texture(texUrl + 'bulletHole3.png'),
      new Texture(texUrl + 'bulletHole4.png'),
      new Texture(texUrl + 'bulletHole5.png')
    ]

    let curDecal = 0
    const createDecal = () => {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY)
      if (pickResult.hit) {
        const normal = scene.activeCamera!.getForwardRay().direction.negateInPlace().normalize()
        const position = pickResult.pickedPoint!
        const sourceMesh = pickResult.pickedMesh!

        sourceMesh.decalMap?.renderTexture(decals[curDecal], position, normal, decalSize)

        curDecal = (curDecal + 1) % decals.length
      }
    }

    scene.onPointerObservable.add((evtData) => {
      if (evtData.type == PointerEventTypes.POINTERUP) {
        if (evtData.event.button == 0) {
          createDecal()
        }
      }
    })

    return scene;
  }
}