import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class FromArrayBuffer {
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

    let gunshot: Sound;
    loadArrayBufferFromURL('https://playground.babylonjs.com/sounds/gunshot.wav');

    function loadArrayBufferFromURL(url: string) {
      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          if (req.status == 200) {
            gunshot = new Sound('FromArrayBuffer', req.response, scene, soundReady);
          }
        }
      };
      req.send(null);
    }

    function soundReady() {
      gunshot.play();
    }

    return scene;
  }
}