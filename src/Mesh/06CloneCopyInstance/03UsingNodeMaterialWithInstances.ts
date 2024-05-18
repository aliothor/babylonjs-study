import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, NodeMaterial, Scene, Vector3 } from "babylonjs";

export default class UsingNodeMaterialWithInstances {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Node Material with Instances'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere');
    NodeMaterial.ParseFromSnippetAsync('#DGN9E2#1').then(mat => {
      sphere.material = mat
    })

    const nInstances = 100
    const range = 50
    for (let i = 0; i < nInstances; i++) {
      const inst = sphere.createInstance('s' + i)
      inst.alwaysSelectAsActiveMesh = true

      inst.position.x = (Math.random() - 0.5) * range
      inst.position.y = (Math.random() - 0.5) * range
      inst.position.z = (Math.random() - 0.5) * range
    }
    camera.radius = range

    return scene;
  }
}