import { ArcRotateCamera, Axis, Color3, CreateGreasedLine, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class TransformingGreasedLineMesh {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Transforming a GreasedLine Mesh'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.setTarget(new Vector3(0, 2, 0))

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const size = 1
    const points = [
      new Vector3(0, 0, -2),
      new Vector3(size, 0, -2),
      new Vector3(size, size, -2),
      new Vector3(0, size, -2),
      new Vector3(0, 0, -2)
    ]
    const line1 = CreateGreasedLine('line1', {points: points}, {color: Color3.Blue()})

    const line2 = CreateGreasedLine('line2', {
      points: points.map(p => {
        return new Vector3(p.x - size / 2, p.y - size / 2, p.z)
      })
    }, {color: Color3.Green()})
    line2.position.y += 2.5

    const line3 = CreateGreasedLine('line3', {
      points: points.map(p => {
        return new Vector3(p.x, p.y + 4, p.z)
      })
    }, {color: Color3.Yellow()})

    // animation
    let i = 1
    scene.onBeforeRenderObservable.add(() => {
      const animRatio = scene.getAnimationRatio()
      line1.position.x = Math.sin(i / 20)
      line2.rotate(Axis.Z, 0.01 * animRatio)
      line3.scaling.x = Math.sin(i / 20) + 1
      i += 0.04
    })

    return scene;
  }
}