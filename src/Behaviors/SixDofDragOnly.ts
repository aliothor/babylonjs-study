import { ArcRotateCamera, AttachToBoxBehavior, BoundingBox, BoundingBoxGizmo, Color3, Engine, FollowBehavior, HemisphericLight, Mesh, MeshBuilder, MultiPointerScaleBehavior, Scene, SceneLoader, SixDofDragBehavior, TransformNode, UtilityLayerRenderer, Vector3 } from "babylonjs";
import { GUI3DManager, HolographicButton, PlanePanel } from "babylonjs-gui";
import 'babylonjs-loaders';

export default class SixDofDragOnly {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, -3, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});
    ground.position.y = -1;

    scene.createDefaultVRExperience({floorMeshes: []});

    SceneLoader.LoadAssetContainer('https://models.babylonjs.com/', 'seagulf.glb', scene, (container) => {
      // 加载文件到场景
      container.addAllToScene();

      container.meshes[0].scaling.scaleInPlace(0.002);

      // 创建拖动盒子
      const gltfMesh = container.meshes[0] as Mesh;
      const boundingBox = BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(gltfMesh);

      // 创建拖动行为
      const sixDofDragBehavior = new SixDofDragBehavior();
      // container.meshes[0].addBehavior(sixDofDragBehavior);
      boundingBox.addBehavior(sixDofDragBehavior);
      const multiPointerScaleBehavior = new MultiPointerScaleBehavior();
      boundingBox.addBehavior(multiPointerScaleBehavior);

      // 创建可见盒子
      const utilLayer = new UtilityLayerRenderer(scene);
      utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
      const gizmo = new BoundingBoxGizmo(Color3.FromHexString('#0984e3'), utilLayer);
      gizmo.attachedMesh = boundingBox;

      // 创建工具条
      const manager = new GUI3DManager();
      const appBar = new TransformNode('');
      appBar.scaling.scaleInPlace(0.3);
      const panel = new PlanePanel();
      panel.margin = 0;
      panel.rows = 1;
      manager.addControl(panel);
      panel.linkToTransformNode(appBar);
      for (let i = 0; i < 2; i++) {
        const button = new HolographicButton('orientation');
        panel.addControl(button);
        button.text = 'Button #' + panel.children.length;
        if (i == 0) {
          button.onPointerClickObservable.add(() => {
            if (gizmo.attachedMesh) {
              gizmo.attachedMesh = null;
              boundingBox.removeBehavior(sixDofDragBehavior);
              boundingBox.removeBehavior(multiPointerScaleBehavior);
            } else {
              gizmo.attachedMesh = boundingBox;
              boundingBox.addBehavior(sixDofDragBehavior);
              boundingBox.addBehavior(multiPointerScaleBehavior);
            }
          });
        }
      }

      // 添加行为
      const behavior = new AttachToBoxBehavior(appBar);
      boundingBox.addBehavior(behavior);
    });

    return scene;
  }
}