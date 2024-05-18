import { ArcRotateCamera, AxisDragGizmo, Color3, Engine, HemisphericLight, MeshBuilder, Scene, UtilityLayerRenderer, Vector3 } from "babylonjs";

export default class GizmoExample {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GizmoExample'
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
    light.intensity = 0.7

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 16 }, scene);
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6, subdivisions: 2 }, scene);

    const utilLayer = new UtilityLayerRenderer(scene)

    const gizmo = new AxisDragGizmo(new Vector3(1, 0, 0), Color3.Teal(), utilLayer)
    gizmo.attachedMesh = sphere

    document.onkeydown = () => {
      gizmo.attachedMesh = gizmo.attachedMesh ? null : sphere
    }

    return scene;
  }
}