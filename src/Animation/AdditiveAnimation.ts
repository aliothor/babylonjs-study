import { AnimationGroup, ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scalar, Scene, SceneLoader, ShadowGenerator, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";
import 'babylonjs-loaders';
import { instancesDeclaration } from "babylonjs/Shaders/ShadersInclude/instancesDeclaration";

export default class AdditiveAnimation {
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
    SceneLoader.ImportMesh('', 'https://playground.babylonjs.com/scenes/', 'Xbot.glb',
      scene, (newMeshes) => {

        shadowGen.addShadowCaster(scene.meshes[0], true);
        for (let i = 0; i < newMeshes.length; i++) {
          newMeshes[i].receiveShadows = false;
        }

        const helper = scene.createDefaultEnvironment({
          enableGroundShadow: true
        });
        helper?.setMainColor(Color3.Gray());
        helper!.ground!.position.y += 0.01;

        const idleAnim = scene.animationGroups.find(a => a.name === 'idle');
        let idleParam = {name: 'Idle', anim: idleAnim, weight: 1};
        idleAnim?.play(true);
        idleAnim?.setWeightForAllAnimatables(1);

        const walkAnim = scene.animationGroups.find(a => a.name === 'walk');
        let walkParam = {name: 'Walk', anim: walkAnim, weight: 1};
        walkAnim?.play(true);
        walkAnim?.setWeightForAllAnimatables(0);

        const runAnim = scene.animationGroups.find(a => a.name === 'run');
        let runParam = {name: 'Run', anim: runAnim, weight: 1};
        runAnim?.play(true);
        runAnim?.setWeightForAllAnimatables(0);

        // 初始化附加动画
        const sadPoseAdmin = AnimationGroup.MakeAnimationAdditive(
          scene.animationGroups.find(a => a.name === 'sad_pose') as AnimationGroup
        );
        sadPoseAdmin.start(true, 1, 0.03 * 60, 0.03 * 60);
        let sadPoseParam = {name: 'Sad Pose', anim: sadPoseAdmin, weight: 0};

        const sneakPoseAdmin = AnimationGroup.MakeAnimationAdditive(
          scene.animationGroups.find(a => a.name === 'sneak_pose') as AnimationGroup
        );
        sneakPoseAdmin.start(true, 1, 0.03 * 60, 0.03 * 60);
        let sneakPoseParam = {name: 'Sneak Pose', anim: sneakPoseAdmin, weight: 0};

        const headShakeAdmin = AnimationGroup.MakeAnimationAdditive(
          scene.animationGroups.find(a => a.name === 'headShake') as AnimationGroup
        );
        headShakeAdmin.play(true);
        let headShakeParam = {name: 'Head Shake', anim: headShakeAdmin, weight: 0};

        const agreeAdmin = AnimationGroup.MakeAnimationAdditive(
          scene.animationGroups.find(a => a.name === 'agree') as AnimationGroup
        );
        agreeAdmin.play(true);
        let agreeParam = {name: 'Agree', anim: agreeAdmin, weight: 0};

        // 当前动画
        let currentParam : any;
        currentParam = idleParam;

        function onBeforeAnimation() {
          // 增加当前动画的权重
          if (currentParam) {
            currentParam.weight = Scalar.Clamp(currentParam.weight + 0.01, 0, 1);
            currentParam.anim?.setWeightForAllAnimatables(currentParam.weight);
          }

          // 减少其他非当前动画权重
          if (currentParam != idleParam) {
            idleParam.weight = Scalar.Clamp(idleParam.weight - 0.01, 0, 1);
            idleParam.anim?.setWeightForAllAnimatables(idleParam.weight);
          }

          if (currentParam != walkParam) {
            walkParam.weight = Scalar.Clamp(walkParam.weight - 0.01, 0, 1);
            walkParam.anim?.setWeightForAllAnimatables(walkParam.weight);
          }

          if (currentParam != runParam) {
            runParam.weight = Scalar.Clamp(runParam.weight - 0.01, 0, 1);
            runParam.anim?.setWeightForAllAnimatables(runParam.weight);
          }

          // 当前动画权重 1 或者所有动画权限 0 ，移除回调函数
          if ((currentParam && currentParam.weight == 1)
              || (idleParam.weight == 0 && walkParam.weight == 0 && runParam.weight == 0)) {
                scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
          }
        }

        // UI
        const advTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
        const uiPanel = new StackPanel();
        uiPanel.width = '220px';
        uiPanel.fontSize = '14px';
        uiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        uiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        advTexture.addControl(uiPanel);

        // 按钮
        let button = Button.CreateSimpleButton('but0', 'None');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          // 移除当前动画
          currentParam = undefined;
          // 重启动画监视
          scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
          scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
        });
        uiPanel.addControl(button);

        button = Button.CreateSimpleButton('but1', 'Idle');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          if (currentParam == idleParam) return;
          // 重启动画监视 idle
          scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
          currentParam = idleParam;
          scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
        });
        uiPanel.addControl(button);

        button = Button.CreateSimpleButton('but2', 'Walk');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          if (currentParam == walkParam) return;

          // 同步动画
          if (currentParam) {
            walkParam.anim?.syncAllAnimationsWith(null);
            currentParam.anim?.syncAllAnimationsWith(walkParam.anim!.animatables[0]);
          }
          // 重启动画监视 walk
          scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
          currentParam = walkParam;
          scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
        });
        uiPanel.addControl(button);

        button = Button.CreateSimpleButton('but3', 'Run');
        button.paddingTop = '10px';
        button.width = '100px';
        button.height = '50px';
        button.color = 'white';
        button.background = 'green';
        button.onPointerClickObservable.add(() => {
          if (currentParam == runParam) return;

          // 同步动画
          if (currentParam) {
            runParam.anim?.syncAllAnimationsWith(null);
            currentParam.anim?.syncAllAnimationsWith(runParam.anim!.animatables[0]);
          }
          // 重启动画监视 run
          scene.onBeforeAnimationsObservable.removeCallback(onBeforeAnimation);
          currentParam = runParam;
          scene.onBeforeAnimationsObservable.add(onBeforeAnimation);
        });
        uiPanel.addControl(button);

        const params = [
          sadPoseParam,
          sneakPoseParam,
          headShakeParam,
          agreeParam
        ];
        params.forEach((param) => {
          const header = new TextBlock();
          header.text = param.name + ':' + param.weight.toFixed(2);
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
          slider.height = '20px';
          slider.width = '205px';
          uiPanel.addControl(slider);
          slider.onValueChangedObservable.add((v) => {
            param.anim.setWeightForAllAnimatables(v);
            param.weight = v;
            header.text = param.name + ':' + param.weight.toFixed(2);
          });
          slider.value = param.weight;
        });



        this.engine.hideLoadingUI();
      })

    return scene;
  }
}