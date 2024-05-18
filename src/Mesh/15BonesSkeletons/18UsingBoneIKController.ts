import { ArcRotateCamera, BoneIKController, Debug, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import dat from "dat.gui";

export default class UsingBoneIKController {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using BoneIKController'
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

    const { meshes, skeletons } = await SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/Dude/', 'Dude.babylon')

    camera.zoomOnFactor = 1.3
    camera.zoomOn(meshes)
    scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

    camera.maxZ = 1000
    const target = MeshBuilder.CreateSphere('target', { diameter: 10 })
    const poleTarget = MeshBuilder.CreateSphere('poleTarget', { diameter: 5 })
    poleTarget.position = new Vector3(0, 100, -50)

    const dude = meshes[0] as Mesh
    const skeleton = skeletons[0]
    target.parent = dude
    poleTarget.parent = dude

    const ikCtl = new BoneIKController(dude, skeleton.bones[14], { targetMesh: target, poleTargetMesh: poleTarget, poleAngle: Math.PI })
    ikCtl.maxAngle = Math.PI * 0.9

    const bone14AxesViewer = new Debug.BoneAxesViewer(scene, skeleton.bones[14], dude, 5)
    const bone13AxesViewer = new Debug.BoneAxesViewer(scene, skeleton.bones[13], dude, 5)

    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    gui.add(ikCtl, 'poleAngle', -Math.PI, Math.PI)
    gui.add(ikCtl, 'maxAngle', 0, Math.PI)
    gui.add(poleTarget.position, 'x', -100, 100).name('pole target x')
    gui.add(poleTarget.position, 'y', -100, 100).name('pole target y')
    gui.add(poleTarget.position, 'z', -100, 100).name('pole target z')

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.03
      target.position.x = -20
      target.position.y = 40 + 40 * Math.sin(t)
      target.position.z = -30 + 40 * Math.cos(t)

      ikCtl.update()
      bone14AxesViewer.update()
      bone13AxesViewer.update()
    })

    scene.debugLayer.show()

    return scene;
  }
}