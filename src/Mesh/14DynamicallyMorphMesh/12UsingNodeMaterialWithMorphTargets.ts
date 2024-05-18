import { ArcRotateCamera, Color3, Engine, HemisphericLight, InputBlock, MeshBuilder, MorphTarget, MorphTargetManager, NodeMaterial, Scene, Vector3 } from "babylonjs";

export default class UsingNodeMaterialWithMorphTargets {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Node Material With Morph Targets'
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

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 16 });
    const mat = await NodeMaterial.ParseFromSnippetAsync('Y5RHPZ#1')
    sphere.material = mat

    const color = mat.getBlockByName('Color3') as InputBlock
    color.value = new Color3(1, 0, 0)

    const manager = new MorphTargetManager()
    sphere.morphTargetManager = manager

    const sphere1 = MeshBuilder.CreateSphere('sphere1', { diameter: 2, segments: 16 })
    sphere1.setEnabled(false)
    sphere1.updateMeshPositions((data) => {
      for (let i = 0; i < data.length; i++) {
        data[i] += 0.4 * Math.random()
      }
    })

    const target = MorphTarget.FromMesh(sphere1, 'target', 0.5)
    manager.addTarget(target)

    let angle = 0
    scene.registerBeforeRender(() => {
      target.influence = Math.sin(angle) * Math.sin(angle)
      angle += 0.01
    })

    await scene.debugLayer.show({ embedMode: true })
    scene.debugLayer.select(mat)

    return scene;
  }
}