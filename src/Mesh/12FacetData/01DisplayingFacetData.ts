import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, Vector3 } from "babylonjs";

export default class DisplayingFacetData {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Displaying Facet Data'
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
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity = 0.7
    
    const m = MeshBuilder.CreateIcoSphere('m', {radius: 2})
    m.updateFacetData()
    const positions = m.getFacetLocalPositions()
    const normals = m.getFacetLocalNormals()    

    const lines = []
    for (let i = 0; i < positions.length; i++) {
      const line = [positions[i], positions[i].add(normals[i])]
      lines.push(line)
    }

    const linSys = MeshBuilder.CreateLineSystem('ls', {lines})
    linSys.color = Color3.Green()

    return scene;
  }
}