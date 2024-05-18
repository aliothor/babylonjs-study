import { ArcRotateCamera, Engine, GizmoManager, HemisphericLight, KeyboardEventTypes, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class UsingGizmoManager {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using GizmoManager'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 3, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // create simple meshes
    const spheres = []
    for (let i = 0; i < 5; i++) {
      const sphere = MeshBuilder.CreateIcoSphere('sphere' + i, { radius: 0.3, flat: true, subdivisions: 1 })
      sphere.scaling.x = 2
      sphere.position.y = 1
      sphere.position.z = i + 5
      spheres.push(sphere)
    }

    // initialize gimomanger
    const gm = new GizmoManager(scene)
    gm.boundingBoxGizmoEnabled = true
    gm.attachableMeshes = spheres

    scene.onKeyboardObservable.add((event) => {
      if (event.type === KeyboardEventTypes.KEYUP) {
        if (event.event.key === 'w') {
          gm.positionGizmoEnabled = !gm.positionGizmoEnabled
        }
        if (event.event.key === 'e') {
          gm.rotationGizmoEnabled = !gm.rotationGizmoEnabled
          gm.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = false
        }
        if (event.event.key === 'r') {
          gm.scaleGizmoEnabled = !gm.scaleGizmoEnabled
        }
        if (event.event.key === 'q') {
          gm.boundingBoxGizmoEnabled = !gm.boundingBoxGizmoEnabled
        }
      }
    })

    return scene;
  }
}