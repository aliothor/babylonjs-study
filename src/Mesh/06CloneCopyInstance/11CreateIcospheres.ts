import { Animation, CubeTexture, EasingFunction, Engine, MeshBuilder, PBRMetallicRoughnessMaterial, QuadraticEase, Scene, Vector3 } from "babylonjs";

export default class CreateIcospheres {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create 10000 Icospheres'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    scene.environmentTexture = new CubeTexture('https://assets.babylonjs.com/environments/environmentSpecular.env', scene)
    scene.createDefaultCamera(true, true, true)
    scene.createDefaultSkybox(scene.environmentTexture, true, 500, 0.3)

    const mat = new PBRMetallicRoughnessMaterial('pbr')
    mat.roughness = 0.2
    mat.metallic = 1

    const ico = MeshBuilder.CreateIcoSphere('ico', {flat: true, subdivisions: 3})
    ico.material = mat

    const sceneSize = 40
    const maxCount = 10000
    const initialCount = 10
    let addPerFrame = 20

    let total = 0
    function createIcoSphere() {
      if (total > maxCount) {
        addPerFrame = 0
        scene.freeActiveMeshes()
        return
      }
      total++
      const inst = ico.createInstance('sphere' + total)
      const scale = Math.random() * 3 + 0.3
      inst.scaling = inst.scaling.scale(scale)
      const radius = Math.random() * 2.5 * sceneSize
      const angle = Math.PI * 2 * Math.random()
      inst.position = new Vector3(
        Math.cos(angle) * radius,
        Math.random() * 2 * sceneSize - sceneSize,
        Math.sin(angle) * radius
      )
      inst.rotation.x = Math.random() * Math.PI
      inst.rotation.y = Math.random() * Math.PI
      inst.rotation.z = Math.random() * Math.PI
      inst.rotationQuaternion = null
      inst.alwaysSelectAsActiveMesh = true
      inst.freezeWorldMatrix()
      inst.isPickable = false
      inst.material?.freeze()
    }

    for (let i = 0; i < initialCount; i++) {
      createIcoSphere()
    }

    const easingFun = new QuadraticEase()
    easingFun.setEasingMode(EasingFunction.EASINGMODE_EASEOUT)

    Animation.CreateAndStartAnimation('radius', scene.activeCamera, 'radius', 30, 90, scene.activeCamera.radius, 170, 0, easingFun)

    let alphaSpeed = 0.001
    scene.onBeforeRenderObservable.add(() => {
      scene.activeCamera.alpha += alphaSpeed

      if (alphaSpeed < 0.005) {
        alphaSpeed *= 1.05
      }

      for (let i = 0; i < addPerFrame; i++) {
        createIcoSphere()
      }
    })

    return scene;
  }
}