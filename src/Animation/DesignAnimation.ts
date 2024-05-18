import { Animation, ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class DesignAnimation {
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');
    box.position.x = 2;

    const frameRate = 10;
    const xSlide = new Animation("xSlide", "position.x", frameRate,
    Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

    const keyFrames = [];
    keyFrames.push({
      frame: 0,
      value: 2
    });
    keyFrames.push({
      frame: frameRate,
      value: -2
    });
    keyFrames.push({
      frame: 2 * frameRate,
      value: 2
    });

    xSlide.setKeys(keyFrames);
    box.animations.push(xSlide);

    const myAnim = scene.beginAnimation(box, 0, 2 * frameRate, true);
    setTimeout(() => {
      myAnim.stop();
    }, 5000);
    // scene.beginDirectAnimation(box, [xSlide], 0, 2 * frameRate, true);


    return scene;
  }
}