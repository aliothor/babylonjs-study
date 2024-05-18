import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class AmbientSound {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // const music = new Sound(
    //   'Violons',
    //   'https://playground.babylonjs.com/sounds/violons11.wav',
    //   scene,
    //   null,
    //   {loop: false, autoplay: true}
    // );

    const music = new Sound(
      'Violons',
      'https://playground.babylonjs.com/sounds/violons11.wav',
      scene,
      () => {
        music.play();
      }
    );

    return scene;
  }
}