import { ArcRotateCamera, AssetsManager, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class LoadingFromAssets {
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

    let music1: Sound, music2: Sound, music3: Sound;
    const asseMan = new AssetsManager();

    const binaryTask1 = asseMan.addBinaryFileTask(
      'Violons11 task',
      'https://playground.babylonjs.com/sounds/violons11.wav'
    );
    binaryTask1.onSuccess = function(task) {
      music1 = new Sound(
        'Violons11',
        task.data,
        scene,
        soundReady,
      );
    }

    const binaryTask2 = asseMan.addBinaryFileTask(
      'Violons18 task',
      'https://playground.babylonjs.com/sounds/violons18.wav'
    );
    binaryTask2.onSuccess = function(task) {
      music2 = new Sound(
        'Violons18',
        task.data,
        scene,
        soundReady,
      );
    }

    const binaryTask3 = asseMan.addBinaryFileTask(
      'Cellolong task',
      'https://playground.babylonjs.com/sounds/cellolong.wav'
    );
    binaryTask3.onSuccess = function(task) {
      music3 = new Sound(
        'Cellolong',
        task.data,
        scene,
        soundReady,
      );
    }

    let ready = 0;

    function soundReady() {
      ready++;
      if (ready == 3) {
        music1.play();
        music2.play();
        music3.play();
      }
    }

    asseMan.load();

    return scene;
  }
}