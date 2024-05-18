import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";

export default class FromMicrophone {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 90, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    const constraints = {audio: true, vedio: false};

    function handleSuccess(stream: MediaStream) {
      const audioTracks = stream.getAudioTracks();
      console.log('Using audio device: ' + audioTracks[0].label);

      const bjsSound = new Sound('mic', stream);
      bjsSound.attachToMesh(box);
      bjsSound.play();
    }

    function handleError(error: any) {
      console.log('navigator.getUserMedia error: ' + error);
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(handleSuccess).catch(handleError);

    return scene;
  }
}