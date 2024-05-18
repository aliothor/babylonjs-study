import { Animation, AnimationGroup, ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Quaternion, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class EquivalentRotationQuaternions {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Equivalent Rotation Quaternions'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 25, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const randAxis = new Vector3(1 - 2 * Math.random(), 1 - 2 * Math.random(), 1 - 2 * Math.random())
    randAxis.normalize()

    // create rotation quaternions for animation
    const startRotation = Quaternion.RotationAxis(randAxis, 0)
    const midRotation = Quaternion.RotationAxis(randAxis, Math.PI)
    const endRotation = Quaternion.RotationAxis(randAxis, 499 * Math.PI / 250)

    // create negate
    const startNegate = startRotation.scale(-1)
    const midNegate = midRotation.scale(-1)
    const endNegate = endRotation.scale(-1)

    // meshes
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/earth.jpg')
    const spherePivot = MeshBuilder.CreateSphere('spherePivot')
    const sphere = MeshBuilder.CreateSphere('sphere')
    sphere.parent = spherePivot
    spherePivot.material = mat

    const negateSpherePivot = MeshBuilder.CreateSphere('negateSpherePivot')
    const negateSphere = MeshBuilder.CreateSphere('negateSphere')
    negateSphere.parent = negateSpherePivot
    negateSpherePivot.material = mat

    const unitNorm = Vector3.Zero()
    randAxis.getNormalToRef(unitNorm)
    unitNorm.normalize()

    const negateAxis = randAxis.negate()

    const line0 = MeshBuilder.CreateLines('line0', {points: [Vector3.Zero(), unitNorm.scale(5)]})
    line0.parent = spherePivot
    sphere.position = unitNorm.scale(5)

    const line1 = MeshBuilder.CreateLines('line1', {points: [Vector3.Zero(), randAxis.scale(12)]})

    const line2 = MeshBuilder.CreateLines('line2', {points: [Vector3.Zero(), unitNorm.scale(7)]})
    line2.color = Color3.Yellow()
    line2.parent = negateSpherePivot
    negateSphere.position = unitNorm.scale(7)

    const line3 = MeshBuilder.CreateLines('line3', {points: [Vector3.Zero(), negateAxis.scale(12)]})
    line3.color = Color3.Yellow()

    // animation
    const animFrameRate = 30  // per sec
    const animTime = 5    // secs
    const nbFrames = animTime * animFrameRate - 1
    const animationRotation = new Animation('animationRotation', 'rotationQuaternion', animFrameRate, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CYCLE)

    const rotationKeys = []
    rotationKeys.push({ frame: 0, value: startRotation })
    rotationKeys.push({ frame: Math.floor(nbFrames / 2), value: midRotation })
    rotationKeys.push({ frame: nbFrames, value: endRotation })
    animationRotation.setKeys(rotationKeys)

    // negate anim
    const animationNegate = new Animation('animationNegate', 'rotationQuaternion', animFrameRate, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CYCLE)

    const negateKeys = []
    negateKeys.push({ frame: 0, value: startNegate })
    negateKeys.push({ frame: Math.floor(nbFrames / 2), value: midNegate })
    negateKeys.push({ frame: nbFrames, value: endNegate })
    animationNegate.setKeys(negateKeys)

    // create animation group
    const animationGroup = new AnimationGroup('animGroup')
    animationGroup.addTargetedAnimation(animationRotation, spherePivot)
    animationGroup.addTargetedAnimation(animationNegate, negateSpherePivot)

    animationGroup.play(true)

    return scene;
  }
}