import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MathBasedRibbonParabolas {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Math Based Ribbon Parabolas 2'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 3 * Math.PI / 2, 3 * Math.PI / 8, 300, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const paths = []
    for (let t = 1; t <= 10; t++) {
      const path = []
      for (let a = -20; a < 20; a++) {
        const x = a * 8
        const y = a * a / t * Math.sin(a / 3) * Math.cos(t)
        const z = t * 50
        path.push(new Vector3(x, y, z))
      }
      MeshBuilder.CreateLines('line' + t, {points: path})
      paths.push(path)
    }

    const ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: paths,
      sideOrientation: Mesh.DOUBLESIDE
    })
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = Color3.Magenta()
    ribbon.material = mat

    return scene;
  }
}