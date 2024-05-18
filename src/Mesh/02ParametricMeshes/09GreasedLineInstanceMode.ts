import { ArcRotateCamera, Axis, Color3, CreateGreasedLine, Engine, GreasedLineMesh, HemisphericLight, Scalar, Scene, Vector3 } from "babylonjs";

export default class GreasedLineInstanceMode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Instance Mode'
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

    let instance: GreasedLineMesh | undefined = undefined
    for (let i = 0; i < 200; i++) {
      const points: Vector3[] = []
      const color = Color3.Random()
      const colors = [color, color]
      for (let j = 0; j < 2; j++) {
        const x = Scalar.RandomRange(-5, 5)
        const y = Scalar.RandomRange(-5, 5)
        const z = Scalar.RandomRange(-5, 5)
        points.push(new Vector3(x, y, z))
      }
      const line1 = CreateGreasedLine('line1', {
        points,
        instance
      }, {
        colors,
        useColors: true
      })
      if (!instance) instance = line1
    }

    if (instance) {
      camera.zoomOnFactor = 1.3
      camera.zoomOn([instance])

      scene.onBeforeRenderObservable.add(() => {
        const animRatio = scene.getAnimationRatio()
        instance?.rotate(Axis.Y, 0.01 * animRatio)
      })
    }

    return scene;
  }
}