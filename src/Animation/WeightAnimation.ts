import { ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";
import 'babylonjs-loaders';

export default class WeightAnimation {
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

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 4, 3, new Vector3(0, 1, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.wheelDeltaPercentage = 0.01;

    const light1 = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    light1.intensity = 0.6;
    light1.specular = Color3.Black();

    const light2 = new DirectionalLight('light2', new Vector3(0, -0.5, -1.0), scene);
    light2.position = new Vector3(0, 5, 5);

    // 影子
    const shadowGen = new ShadowGenerator(1024, light2);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 32;

    this.engine.displayLoadingUI();

    // 加载模型
    SceneLoader.ImportMesh('', 'https://playground.babylonjs.com/scenes/', 'dummy2.babylon',
      scene, (newMeshes, particlesSystem, skeletons) => {
        const skeleton = skeletons[0];

        shadowGen.addShadowCaster(scene.meshes[0], true);
        for (let i = 0; i < newMeshes.length; i++) {
          newMeshes[i].receiveShadows = false;
        }

        const helper = scene.createDefaultEnvironment({
          enableGroundShadow: true
        });
        helper?.setMainColor(Color3.Gray());
        helper!.ground!.position.y += 0.01;

        const idleAnim = scene.beginWeightedAnimation(skeleton, 0, 89, 1.0, true);
        const walkAnim = scene.beginWeightedAnimation(skeleton, 90, 118, 0, true);
        const runAnim = scene.beginWeightedAnimation(skeleton, 119, 135, 0, true);

        // UI
        const advTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
        const uiPanel = new StackPanel();
        uiPanel.width = '220px';
        uiPanel.fontSize = '14px';
        uiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        uiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        advTexture.addControl(uiPanel);
        const params = [
          {name: 'Idle', anim: idleAnim},
          {name: 'Walk', anim: walkAnim},
          {name: 'Run', anim: runAnim}
        ];
        params.forEach((param) => {
          const header = new TextBlock();
          header.text = param.name + ':' + param.anim.weight.toFixed(2);
          header.height = '40px';
          header.color = 'green';
          header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          header.paddingTop = '10px';
          uiPanel.addControl(header);

          const slider = new Slider();
          slider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
          slider.minimum = 0;
          slider.maximum = 1;
          slider.color = 'green';
          slider.value = param.anim.weight;
          slider.height = '20px';
          slider.width = '205px';
          uiPanel.addControl(slider);
          slider.onValueChangedObservable.add((v) => {
            param.anim.weight = v;
            header.text = param.name + ':' + param.anim.weight.toFixed(2);
          });
          param.anim._slider = slider;
        });

        let button = Button.CreateSimpleButton('but0', 'From idle to walk');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          idleAnim._slider.value = 1.0;
          walkAnim._slider.value = 0;
          runAnim._slider.value = 0;
          // 同步动画
          walkAnim.syncWith(null);
          idleAnim.syncWith(walkAnim);
          const obs = scene.onBeforeAnimationsObservable.add(() => {
            idleAnim._slider.value -= 0.01;

            if (idleAnim._slider.value <= 0) {
              scene.onBeforeAnimationsObservable.remove(obs);
              idleAnim._slider.value = 0;
              walkAnim._slider.value = 1.0;
            } else {
              walkAnim._slider.value = 1.0 - idleAnim._slider.value;
            }
          });
        });
        uiPanel.addControl(button);

        button = Button.CreateSimpleButton('but0', 'From walk to run');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          idleAnim._slider.value = 0;
          walkAnim._slider.value = 1;
          runAnim._slider.value = 0;
          // 同步动画
          walkAnim.syncWith(runAnim);
          const obs = scene.onBeforeAnimationsObservable.add(() => {
            walkAnim._slider.value -= 0.01;

            if (walkAnim._slider.value <= 0) {
              scene.onBeforeAnimationsObservable.remove(obs);
              walkAnim._slider.value = 0;
              runAnim._slider.value = 1.0;
            } else {
              runAnim._slider.value = 1.0 - walkAnim._slider.value;
            }
          });
        });
        uiPanel.addControl(button);

        this.engine.hideLoadingUI();
      })

    return scene;
  }
}