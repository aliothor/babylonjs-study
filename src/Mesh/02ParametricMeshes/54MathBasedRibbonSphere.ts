import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MathBasedRibbonSphere {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Math Based Ribbon Sphere'
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
    for (let t = 0; t <= Math.PI; t += Math.PI / 20) {
      const path = []
      for (let a = 0; a < 2 * Math.PI; a += Math.PI / 20) {
        const x = 4 * Math.cos(a) * Math.sin(t)
        const y = 4 * Math.sin(a) * Math.sin(t)
        const z = 4 * Math.cos(t)
        path.push(new Vector3(x, y, z))
      }
      path.push(path[0])
      paths.push(path)
    }

    const ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: paths
    })
    ribbon.material = new StandardMaterial('mat')
    ribbon.material.wireframe = true

    return scene;
  }
}