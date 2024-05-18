import { ArcRotateCamera, CreateGreasedLine, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class GreasedLineVisibility {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Visibility'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const line = CreateGreasedLine('line', {
      points: [
        -10, 0, 0,
        10, 2, 0
      ]
    }, {
      visibility: 0
    })

    let visibility = 0
    scene.onBeforeRenderObservable.add(() => {
      if (visibility <= 1) {
        visibility += 0.005 * scene.getAnimationRatio()
      }
      line.greasedLineMaterial!.visibility = visibility
    })

    camera.zoomOnFactor = 1.3
    camera.zoomOn([line])

    return scene;
  }
}