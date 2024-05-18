import { ArcRotateCamera, Color3, Engine, HemisphericLight, HighlightLayer, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class OverlappingMeshHighlignts {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Overlapping Mesh Highlignts'
    this.engine = new Engine(this.canvas, true, {stencil: true});
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

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    sphere.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})

    const hl = new HighlightLayer('hl')
    hl.addMesh(sphere, Color3.White())

    const hl2 = new HighlightLayer('hl2')
    hl2.addMesh(ground, Color3.Red())

    return scene;
  }
}