import { Animation, ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CombineAnimation {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 4, 10, Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light1 = new DirectionalLight('DirectLight', new Vector3(0, -1, 1), scene);
    const light2 = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
    light1.intensity = 0.75;
    light2.intensity = 0.5;

    const box = MeshBuilder.CreateBox('box');
    box.position.x = 2;

    // 动画 滑动
    const frameRate = 10;

    const xSlide = new Animation('xSlide', 'position.x', frameRate,
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    
    let keyFrames = [];
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

    // 旋转
    const yRot = new Animation('yRot', 'rotation.y', frameRate,
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    
    keyFrames = [];
    keyFrames.push({
      frame: 0,
      value: 0
    });
    keyFrames.push({
      frame: 2.5 * frameRate,
      value: 2 * Math.PI
    });
    keyFrames.push({
      frame: 2 * frameRate,
      value: 4 * Math.PI
    });

    yRot.setKeys(keyFrames);

    // scene.beginDirectAnimation(box, [xSlide, yRot], 0, 2 * frameRate, true);
    let nextAnim = function() {
      scene.beginDirectAnimation(box, [xSlide, yRot], 0, 2 * frameRate, true);
    }
    scene.beginDirectAnimation(box, [yRot], 0, 2 * frameRate, false, 1, nextAnim);

    return scene;
  }
}