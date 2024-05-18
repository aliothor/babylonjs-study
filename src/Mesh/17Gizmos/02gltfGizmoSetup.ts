import { ArcRotateCamera, BoundingBoxGizmo, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, Scene, SceneLoader, SixDofDragBehavior, UtilityLayerRenderer, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class gltfGizmoSetup {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'gltf Gizmo Setup'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6, subdivisions: 2 }, scene);

    // 加载 gltf 模型
    const container = await SceneLoader.LoadAssetContainerAsync('/Meshes/Ducky_2.glb')
    container.addAllToScene()
    container.meshes[0].scaling.scaleInPlace(0.3)

    const glbMesh = container.meshes[0] as Mesh
    const boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(glbMesh)

    const utilLayer = new UtilityLayerRenderer(scene)
    utilLayer.utilityLayerScene.autoClearDepthAndStencil = false
    const gizmo = new BoundingBoxGizmo(Color3.FromHexString('#0984e3'), utilLayer)
    gizmo.attachedMesh = boundingBox

    const sixDofDragBehavior = new SixDofDragBehavior()
    boundingBox.addBehavior(sixDofDragBehavior)
    const multiPointerScaleBehavior = new MultiPointerScaleBehavior()
    boundingBox.addBehavior(multiPointerScaleBehavior)

    // scene.createDefaultXRExperienceAsync({ floorMeshes: [ground] })
    scene.createDefaultVRExperience({ floorMeshes: [ground] })

    return scene;
  }
}