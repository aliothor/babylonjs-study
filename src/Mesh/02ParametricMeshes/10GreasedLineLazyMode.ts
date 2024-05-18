import { ArcRotateCamera, Axis, Color3, CreateGreasedLine, Engine, GreasedLineMesh, HemisphericLight, Scalar, Scene, Vector3 } from "babylonjs";

export default class GreasedLineLazyMode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Lazy Mode'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 1.2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    let instance: GreasedLineMesh | undefined = undefined
    const numOfLines = 4096
    const frequency = 5 / numOfLines
    for (let i = 0; i < numOfLines; i++) {
      const points: Vector3[] = []
      const widths: number[] = []
      const r = Math.floor(Math.sin(frequency * i + 0) * 127 + 128)
      const g = Math.floor(Math.sin(frequency * i + 2) * 127 + 128)
      const b = Math.floor(Math.sin(frequency * i + 4) * 127 + 128)
      const color = Color3.FromInts(r, g, b)
      const colors = [color, color]
      for (let j = 0; j < 2; j++) {
        const x = Math.cos(i) * j
        const y = Math.sin(i) * j
        const z = i / (numOfLines / 4)
        points.push(new Vector3(x, y, z))
        widths.push(Scalar.RandomRange(1, 22), Scalar.RandomRange(1, 4))
      }

      const line1 = CreateGreasedLine('line1', {
        points,
        instance,
        widths,
        lazy: true
      }, {
        createAndAssignMaterial: true,
        sizeAttenuation: true,
        colors,
        useColors: true,
        width: 1
      })

      if (!instance) instance = line1
    }

    if (instance) {
      instance.updateLazy()
      camera.zoomOnFactor = 1.3
      camera.zoomOn([instance])

      scene.onBeforeRenderObservable.add(() => {
        instance?.rotate(Axis.Z, -0.01 * scene.getAnimationRatio())
      })
    }

    return scene;
  }
}