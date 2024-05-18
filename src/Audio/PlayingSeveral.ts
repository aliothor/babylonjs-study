import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class PlayingSeveral {
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

    const music1 = new Sound(
      'Violons11',
      'https://playground.babylonjs.com/sounds/violons11.wav',
      scene,
      soundReady,
      {autoplay: false}
    );

    const music2 = new Sound(
      'Violons18',
      'https://playground.babylonjs.com/sounds/violons18.wav',
      scene,
      soundReady,
      {autoplay: false}
    );

    const music3 = new Sound(
      'Cellolong',
      'https://playground.babylonjs.com/sounds/cellolong.wav',
      scene,
      soundReady,
      {autoplay: false}
    );

    let ready = 0;

    function soundReady() {
      ready++;
      if (ready == 3) {
        music1.play();
        music2.play();
        music3.play();
      }
    }

    return scene;
  }
}