import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, MirrorTexture, Plane, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ReflectionBlur {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Reflection Blur'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.upperBetaLimit = Math.PI / 2
    camera.lowerRadiusLimit = 4

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    // main
    const knot = MeshBuilder.CreateTorusKnot('knot', {radius: 1, tube: 0.4, radialSegments: 128, tubularSegments: 64, p: 2, q: 3})
    const kMat = new StandardMaterial('kMat')
    kMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    knot.material = kMat

    // mirror
    const mirror = MeshBuilder.CreateBox('mirror')
    mirror.scaling = new Vector3(100, 0.01, 100)
    const mMat = new StandardMaterial('mMat')
    const mTex = new MirrorTexture('mTex', {ratio: 0.5}, scene, true)
    mTex.mirrorPlane = new Plane(0, -1, 0, -2)
    mTex.renderList = [knot]
    mTex.level = 1
    mTex.adaptiveBlurKernel = 32
    mMat.reflectionTexture = mTex
    mirror.material = mMat
    mirror.position = new Vector3(0, -2, 0)

    // fog
    scene.fogMode = Scene.FOGMODE_LINEAR
    scene.fogColor = Color3.FromHexString(scene.clearColor.toHexString(true))
    scene.fogStart = 20
    scene.fogEnd = 50

    return scene;
  }
}