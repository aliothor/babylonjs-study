import { ArcRotateCamera, AxesViewer, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class InstancesAndLOD {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Instances and LODs'
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

    // mesh
    const plane = MeshBuilder.CreatePlane('plane', { size: 2 })
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = Color3.Red()
    mat.backFaceCulling = false
    plane.material = mat

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 16 })
    sphere.position.y = 1

    plane.setEnabled(false)
    sphere.setEnabled(false)

    new AxesViewer(scene, 3)

    // instance
    function addInstance(m: Mesh, n: string, x?: number, y?: number, z?: number) {
      const i = m.createInstance(n)
      i.position.x = x || 0
      i.position.y = y || 0
      i.position.z = z || 0
      return i
    }

    sphere.addLODLevel(30, plane)
    addInstance(sphere, 'root')
    addInstance(sphere, '0', 20, 1)
    addInstance(sphere, '1', -20, 1)
    addInstance(sphere, '2', 0, 1, 20)
    addInstance(sphere, '3', 0, 1, -20)
    

    return scene;
  }
}