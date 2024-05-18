import { Timeline } from "@babylonjs/controls";
import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class TimelineUsed {
  engine: Engine;
  scene: Scene;

  constructor(private canvas: HTMLCanvasElement) {
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    const tcanvas: HTMLCanvasElement = document.createElement('canvas');
    tcanvas.style.width = '200px';
    tcanvas.style.height = '50px';

    const timeLine = new Timeline(tcanvas, {
      totalDuration: 60,
      thumbnailWidth: 128,
      thumbnailHeight: 120,
      loadingTextureURI: './assets/Espilit/Tree.png',
      getThumbnailCallback(time, done: (input: any) => void) {
        const hiddenVideo = document.createElement('video');
        document.body.append(hiddenVideo);
        // hiddenVideo.style.display = 'none';

        hiddenVideo.setAttribute('playsinline', '');
        // hiddenVideo.muted = true;
        hiddenVideo.autoplay = navigator.userAgent.indexOf('Edge') > 0 ? false : true;
        hiddenVideo.loop = false;

        hiddenVideo.onloadeddata = () => {
          if (time === 0) {
            done(hiddenVideo);
          } else {
            hiddenVideo.onseeked = () => {
              done(hiddenVideo);
            }
            hiddenVideo.currentTime = time;
          }
        }

        console.log('here.');
        hiddenVideo.src = 'test.mp4?' + time;
        hiddenVideo.load();
      },
    });

    timeLine.runRenderLoop();

    return scene;
  }
}