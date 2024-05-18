import { ArcRotateCamera, CascadedShadowGenerator, Color3, DirectionalLight, Engine, HemisphericLight, LightGizmo, Mesh, MeshBuilder, Scene, SceneLoader, ShadowGenerator, StandardMaterial, Vector3 } from "babylonjs";

export default class CascadedShadowMap {
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

    const sceneSize = 2000
    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, sceneSize * 1.1, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, -1, -1), scene);
    light.intensity = 0.8
    light.autoCalcShadowZBounds = true

    // gizmo
    const lightGizmo = new LightGizmo()
    lightGizmo.light = light

    // meshes
    const base = MeshBuilder.CreateTorusKnot('base', {radius: 20, tube: 5})
    base.material = new StandardMaterial('baseMat')
    base.material.diffuseColor = Color3.Green()
    const objects = this.populateScene(base, 200, sceneSize, scene)

    // floor
    const floor = MeshBuilder.CreateGround('floor', {width: sceneSize, height: sceneSize})
    floor.receiveShadows = true

    // shadow
    const csm = new CascadedShadowGenerator(1024, light)
    // csm.debug = true
    // const csm = new ShadowGenerator(1024, light)
    for (let i = 0; i < objects.length; i++) {
      csm.addShadowCaster(objects[i])
    }

    return scene;
  }

  private populateScene(base: Mesh, numObjs: number, size: number, scene: Scene) {
    const created = []
    for (let i = 0; i < numObjs; i++) {
      const obj = base.createInstance(`b${i}`)
      obj.position.x = (Math.random() - 0.5) * size
      obj.position.y = Math.random() * size * 0.25 + 1
      obj.position.z = (Math.random() - 0.5) * size

      obj.rotation = Vector3.Random(0, 3.14)
      created.push(obj)
    }
    return created
  }
}