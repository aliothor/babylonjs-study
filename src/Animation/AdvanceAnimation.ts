import { Animation, ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class AdvanceAnimation {
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

    const camera = new ArcRotateCamera('camera', 0, 0.8, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(0, 100, 100), scene);

    const box = MeshBuilder.CreateBox('box', {size: 10});
    const boxMat = new StandardMaterial('boxMat');
    boxMat.diffuseColor = new Color3(0, 1, 0);
    box.material = boxMat;

    // const animBox = new Animation('anim', 'scaling.x', 30, 
    //   Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    
    // const keys = [];
    // keys.push({
    //   frame: 0,
    //   value: 1
    // });
    // keys.push({
    //   frame: 20,
    //   value: 0.2
    // });
    // keys.push({
    //   frame: 100,
    //   value: 1
    // });
    // animBox.setKeys(keys);

    // box.animations.push(animBox);

    // setTimeout(async () => {
    //   const anim = scene.beginAnimation(box, 0, 100, false);

    //   console.log('before');
    //   await anim.waitAsync();
    //   console.log('after');
    // })

    // Animation.CreateAndStartAnimation('box1', box, 'scaling.y', 30, 120, 1, 2.5);

    // 动画1
    const anim1 = new Animation('anim1', 'position.z', 30,
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    
    const keys = [];
    keys.push({
      frame: 0,
      value: 0
    });
    keys.push({
      frame: 30,
      value: 20
    });
    keys.push({
      frame: 60,
      value: 0
    });
    anim1.setKeys(keys);

    box.animations.push(anim1);

    scene.beginAnimation(box, 0, 100, true);


    // 动画2  混合动画
    const anim2 = new Animation('anim2', 'position.y', 30,
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

    anim2.enableBlending = true;
    anim2.blendingSpeed = 0.01;

    anim2.setKeys(keys);

    scene.onPointerDown = function(evt, pickResult) {
      if (pickResult.pickedMesh) {
        scene.stopAnimation(box);
        scene.beginDirectAnimation(box, [anim2], 0, 100, true);
      }
    }

    return scene;
  }
}