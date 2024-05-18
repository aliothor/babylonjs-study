import { Animation, ArcRotateCamera, Engine, HemisphericLight, Mesh, Scene, SceneLoader, Vector3 } from "babylonjs";
import "babylonjs-loaders";

export default class AnimatingMorphTargets {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Animating Morph Targets'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 0.5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.01

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    await SceneLoader.AppendAsync('https://patrickryanms.github.io/BabylonJStextures/Demos/morphTarget/glb/cubeSphereMorph.glb')

    // stop and remove enbeded animation group
    scene.animationGroups[0].stop()
    scene.animationGroups[0].dispose()

    let mesh: Mesh = new Mesh('')
    // find cube mesh with morph target manger
    for (let m of scene.meshes) {
      if (m.name == 'cube') {
        mesh = m as Mesh
      }
    }

    const cubeMesh = mesh.morphTargetManager?.getTarget(0)
    // new animation
    const anim = new Animation('anim', 'influence', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)

    // set keys
    const keyFrames = [
      { frame: 0, value: 0 },
      { frame: 120, value: 1 },
      { frame: 240, value: 0 }
    ]

    anim.setKeys(keyFrames)
    cubeMesh?.animations.push(anim)
    scene.beginAnimation(cubeMesh, 0, 240, true, 1)

    return scene;
  }
}