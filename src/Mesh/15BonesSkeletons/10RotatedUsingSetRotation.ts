import { ArcRotateCamera, AxesViewer, Debug, Engine, HemisphericLight, Scene, SceneLoader, Space, Vector3 } from "babylonjs";
import dat from "dat.gui";

export default class RotatedUsingSetRotation {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Rotated Using SetRotation'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 1, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const strData = JSON.stringify(modelData);
    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'data:' + strData)
    const mesh = meshes[0]
    const skeleton = skeletons[0]

    mesh.rotation.y = Math.PI

    new AxesViewer(scene, 1.5)

    const axisBone1 = new AxesViewer()
    axisBone1.xAxis.attachToBone(skeleton.bones[1], mesh)
    axisBone1.yAxis.attachToBone(skeleton.bones[1], mesh)
    axisBone1.zAxis.attachToBone(skeleton.bones[1], mesh)

    const axisBone2 = new AxesViewer()
    axisBone2.xAxis.attachToBone(skeleton.bones[2], mesh)
    axisBone2.yAxis.attachToBone(skeleton.bones[2], mesh)
    axisBone2.zAxis.attachToBone(skeleton.bones[2], mesh)

    // 使用 Space.WORLD 设置旋转角度时，显示调试骨骼避免渲染错误
    const skelViewer = new Debug.SkeletonViewer(skeleton, mesh, scene)
    skelViewer.changeDisplayMode(Debug.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS)

    scene.onBeforeRenderObservable.add(() => {
      skeleton.bones[1].setRotation(rotation, Space.WORLD, mesh)
      // skeleton.bones[1].setRotation(rotation, Space.LOCAL, mesh)
    })

    // gui
    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    const rotation = Vector3.Zero()
    gui.add(rotation, 'x', -Math.PI, Math.PI, 0.01)
    gui.add(rotation, 'y', -Math.PI, Math.PI, 0.01)
    gui.add(rotation, 'z', -Math.PI, Math.PI, 0.01)

    return scene;
  }
}

const modelData = {
  "producer": { "name": "Blender", "version": "2.76 (sub 0)", "exporter_version": "4.6.0", "file": "test3.babylon" },
  "autoClear": true, "clearColor": [0.0509, 0.0509, 0.0509], "ambientColor": [0, 0, 0], "gravity": [0, -9.81, 0],
  "materials": [{ "name": "test3.Material", "id": "test3.Material", "ambient": [0.8, 0.8, 0.8], "diffuse": [0.64, 0.64, 0.64], "specular": [0.5, 0.5, 0.5], "emissive": [0, 0, 0], "specularPower": 50, "alpha": 1, "backFaceCulling": true, "checkReadyOnlyOnce": false }],
  "multiMaterials": [],
  "skeletons": [{
    "name": "Armature", "id": 0, "dimensionsAtRest": [0, 3.0652, 0], "bones": [
      { "name": "Bone", "index": 0, "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1], "rest": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1], "parentBoneIndex": -1, "length": 1 },
      { "name": "Bone.001", "index": 1, "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], "rest": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], "parentBoneIndex": 0, "length": 0.9815 },
      { "name": "Bone.002", "index": 2, "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.9815, 0, 1], "rest": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.9815, 0, 1], "parentBoneIndex": 1, "length": 1.0838 }]
  }],
  "meshes": [{
    "name": "Cube", "id": "Cube", "materialId": "test3.Material", "billboardMode": 0, "position": [0, 0, 0], "rotation": [0, 0, 0], "scaling": [1, 1, 1], "isVisible": true, "freezeWorldMatrix": false, "isEnabled": true, "checkCollisions": false, "receiveShadows": false, "skeletonId": 0, "numBoneInfluencers": 2
    , "positions": [-0.2743, 0.897, 0.2743, -0.2743, -0.0422, 0.2743, -0.2743, -0.0422, -0.2743, 0.2743, 0.897, 0.2743, 0.2743, -0.0422, 0.2743, 0.2743, 0.897, -0.2743, 0.2743, -0.0422, -0.2743, -0.2743, 0.897, -0.2743, -0.2743, 1.1148, -0.2743, -0.2743, 1.1148, 0.2743, 0.2743, 1.1148, 0.2743, 0.2743, 1.8536, 0.2743, 0.2743, 1.8536, -0.2743, 0.2743, 1.1148, -0.2743, 0.2743, 2.1056, -0.2743, -0.2743, 2.1056, -0.2743, -0.2743, 1.8536, -0.2743, -0.2743, 1.8536, 0.2743, 0.2743, 2.1056, 0.2743, 0.2743, 3.0981, 0.2743, 0.2743, 3.0981, -0.2743, -0.2743, 2.1056, 0.2743, -0.2743, 3.0981, 0.2743, -0.2743, 3.0981, -0.2743]
    , "normals": [-0.7071, 0, 0.7071, -0.5773, -0.5773, 0.5773, -0.5773, -0.5773, -0.5773, 0.7071, 0, 0.7071, 0.5773, -0.5773, 0.5773, 0.7071, 0, -0.7071, 0.5773, -0.5773, -0.5773, -0.7071, 0, -0.7071, -0.7071, 0, -0.7071, -0.7071, 0, 0.7071, 0.7071, 0, 0.7071, 0.7071, 0, 0.7071, 0.7071, 0, -0.7071, 0.7071, 0, -0.7071, 0.7071, 0, -0.7071, -0.7071, 0, -0.7071, -0.7071, 0, -0.7071, -0.7071, 0, 0.7071, 0.7071, 0, 0.7071, 0.5773, 0.5773, 0.5773, 0.5773, 0.5773, -0.5773, -0.7071, 0, 0.7071, -0.5773, 0.5773, 0.5773, -0.5773, 0.5773, -0.5773]
    , "matricesWeights": [0.8258, 0.1712, 0, 0, 0.9877, 0, 0, 0, 0.9868, 0, 0, 0, 0.8257, 0.1712, 0, 0, 0.9868, 0, 0, 0, 0.8258, 0.1712, 0, 0, 0.9877, 0, 0, 0, 0.8257, 0.1712, 0, 0, 0.2042, 0.7818, 0, 0, 0.2042, 0.7818, 0, 0, 0.2042, 0.7818, 0, 0, 0.8013, 0.1831, 0, 0, 0.8013, 0.1831, 0, 0, 0.2042, 0.7818, 0, 0, 0.1482, 0.849, 0, 0, 0.1482, 0.8489, 0, 0, 0.8013, 0.1831, 0, 0, 0.8013, 0.1831, 0, 0, 0.1482, 0.8489, 0, 0, 0.9894, 0, 0, 0, 0.9903, 0, 0, 0, 0.1482, 0.849, 0, 0, 0.9903, 0, 0, 0, 0.9894, 0, 0, 0]
    , "matricesIndices": [256, 0, 0, 256, 0, 256, 0, 256, 256, 256, 256, 513, 513, 256, 513, 513, 513, 513, 513, 2, 2, 513, 2, 2]
    , "indices": [0, 1, 2, 3, 4, 1, 5, 6, 4, 7, 2, 6, 1, 4, 6, 7, 8, 9, 10, 11, 12, 5, 13, 8, 0, 9, 10, 3, 10, 13, 12, 14, 15, 8, 16, 17, 13, 12, 16, 9, 17, 11, 18, 19, 20, 17, 21, 18, 11, 18, 14, 16, 15, 21, 20, 19, 22, 15, 23, 22, 14, 20, 23, 21, 22, 19, 7, 0, 2, 0, 3, 1, 3, 5, 4, 5, 7, 6, 2, 1, 6, 0, 7, 9, 13, 10, 12, 7, 5, 8, 3, 0, 10, 5, 3, 13, 16, 12, 15, 9, 8, 17, 8, 13, 16, 10, 9, 11, 14, 18, 20, 11, 17, 18, 12, 11, 14, 17, 16, 21, 23, 20, 22, 21, 15, 22, 15, 14, 23, 18, 21, 19]
    , "subMeshes": [{ "materialIndex": 0, "verticesStart": 0, "verticesCount": 24, "indexStart": 0, "indexCount": 132 }]
    , "instances": []
  }
  ],
  "cameras": [{ "name": "Camera", "id": "Camera", "position": [7.4811, 5.3437, -6.5076], "rotation": [0.4615, -0.8149, 0.0108], "fov": 0.8576, "minZ": 0.1, "maxZ": 100, "speed": 1, "inertia": 0.9, "checkCollisions": false, "applyGravity": false, "ellipsoid": [0.2, 0.9, 0.2], "cameraRigMode": 0, "interaxial_distance": 0.0637, "type": "FreeCamera" }], "activeCamera": "Camera",
  "lights": [{ "name": "Lamp", "id": "Lamp", "type": 0, "position": [4.0762, 5.9039, 1.0055], "intensity": 1, "diffuse": [1, 1, 1], "specular": [1, 1, 1] }],
  "shadowGenerators": []
};