import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3, VideoDome } from "babylonjs";

export default class Video360 {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
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
    camera.inputs.attached.mousewheel.detachControl();

    const videoDome = new VideoDome(
      'videoDome',
      ['t2.mp4'],
      {
        resolution: 32,
        size: 50,
        autoPlay: false,
        clickToPlay: true
      },
      scene
    );

    return scene;
  }
}