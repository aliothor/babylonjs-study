import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MathBasedRibbonParabolas {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Math Based Ribbon Parabolas 1'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const paths = []
    for (let t = -6; t <= 6; t++) {
      const path = []
      for (let a = -20; a < 20; a++) {
        const x = a
        const y = a * a
        const z = t
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
    // ribbon.material.wireframe = true

    return scene;
  }
}