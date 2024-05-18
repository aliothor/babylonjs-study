import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class InteractionPlaying {
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

    let volume = 0.1;
    let playbackRate = 0.5;
    const gunshot = new Sound(
      'gunshot',
      'https://playground.babylonjs.com/sounds/gunshot.wav',
      scene,
      null,
      {playbackRate: playbackRate, volume: volume}
    );

    gunshot.onended = function() {
      if (volume < 1) {
        volume += 0.1;
        gunshot.setVolume(volume);
      }
      playbackRate += 0.1;
      gunshot.setPlaybackRate(playbackRate);
      console.log('volume: ' + volume, 'playbackRate: ' + playbackRate);
    }

    window.addEventListener('mousedown', (evt) => {
      if (evt.button === 0) {
        gunshot.play();
      }
    });

    window.addEventListener('keydown', (evt) => {
      if (evt.key === ' ') {
        gunshot.play();
      }
    });

    return scene;
  }
}