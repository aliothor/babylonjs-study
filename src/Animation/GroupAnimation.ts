import { Animation, AnimationGroup, ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "babylonjs-gui";

export default class GroupAnimation {
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

    // 基本环境
    const camera = new ArcRotateCamera('camera', 0, 0.8, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('pointlight', new Vector3(0, 100, 100), scene);

    // 基本实体
    const box1 = MeshBuilder.CreateBox('box1', {size: 10});
    box1.position.x = -20;
    const box2 = MeshBuilder.CreateBox('box2', {size: 10});
    box2.position.x = 20;

    // 基本材料
    const matBox1 = new StandardMaterial('texture1');
    matBox1.diffuseColor = new Color3(0, 1, 0); // green
    const matBox2 = new StandardMaterial('texture2');

    box1.material = matBox1;
    box2.material = matBox2;

    // 缩放动画
    const anim1 = new Animation('anim1', 'scaling.x', 30, 
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    let keys = [];
    keys.push({
      frame: 0,
      value: 1
    });
    keys.push({
      frame: 20,
      value: 0.2
    });
    keys.push({
      frame: 100,
      value: 1
    });
    anim1.setKeys(keys);

    // 旋转动画
    const anim2 = new Animation('anim2', 'rotation.y', 30, 
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    keys = [];
    keys.push({
      frame: 0,
      value: 0
    });
    keys.push({
      frame: 40,
      value: Math.PI
    });
    keys.push({
      frame: 80,
      value: 0
    });
    anim2.setKeys(keys);

    // 创建动画分组
    const animGroup = new AnimationGroup('my group');
    animGroup.addTargetedAnimation(anim1, box1);
    animGroup.addTargetedAnimation(anim2, box1);
    animGroup.addTargetedAnimation(anim2, box2);

    animGroup.normalize(0, 100);

    // 事件检测
    animGroup.onAnimationEndObservable.add((group) => {
      console.log('onAnimationEndObservable', group.animation.name);
    })

    // UI
    const texture1 = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const panel = new StackPanel();
    panel.isVertical = false;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    texture1.addControl(panel);

    const addButton = function(text: string, callback: any) {
      const button = Button.CreateSimpleButton('button', text);
      button.width = '140px';
      button.height = '40px';
      button.color = 'white';
      button.background = 'green';
      button.paddingLeft = '10px';
      button.paddingRight = '10px';
      button.onPointerUpObservable.add(function() {
        callback();
      });
      panel.addControl(button);
    }

    addButton('Play', () => {
      animGroup.play(true);
    });
    addButton('Pause', () => {
      animGroup.pause();
    });
    addButton('Stop', () => {
      animGroup.reset();
      animGroup.stop();
    });

    return scene;
  }
}