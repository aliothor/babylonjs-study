import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, Vector3 } from "babylonjs";

export default class CustomShape {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Shape'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity = 0.7

    const box = MeshBuilder.CreateBox('box', { size: 50, updatable: true });

    const positions = box.getVerticesData('position')
    if (positions) {
      const colors = []
      for (let i = 0; i < positions.length; i += 3) {
        colors.push(Math.random(), Math.random(), Math.random(), 1)
      }
      box.setVerticesData('color', colors)
    }

    let t = 0
    scene.registerBeforeRender(() => {
      box.updateMeshPositions((pos) => {
        let delta = t
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] += Math.sin(pos[i + 1] / 6 + delta)
          pos[i + 2] += Math.sin(pos[i] / 12 + delta)
          delta += 0.00005
        }
      })
      t += 0.5
    })

    return scene;
  }
}