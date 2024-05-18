import { ActionManager, ArcRotateCamera, Color3, CubeTexture, DirectionalLight, Engine, ExecuteCodeAction, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";
import "babylonjs-loaders";

export default class CharacterAnimation {
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

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 4, 10, new Vector3(0, -5, 0));
    // camera.attachControl(this.canvas, true);
    scene.activeCamera = camera;
    scene.activeCamera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.wheelDeltaPercentage = 0.01;

    const light1 = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    light1.intensity = 0.6;
    light1.specular = Color3.Black();

    const light2 = new DirectionalLight('light2', new Vector3(0, -0.5, -1.0), scene);
    light2.position = new Vector3(0, 5, 5);

    // 天空盒
    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000});
    const skyMat = new StandardMaterial('skyboxm');
    skyMat.backFaceCulling = false;
    skyMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox2', scene);
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMat.diffuseColor = new Color3(0, 0, 0);
    skyMat.specularColor = new Color3(0, 0, 0);
    skybox.material = skyMat;

    // 地面
    const ground = MeshBuilder.CreateGround('ground', {height: 50, width: 50, subdivisions: 4});
    const groundMat = new StandardMaterial('groundM');
    groundMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/wood.jpg', scene);
    groundMat.diffuseTexture.uScale = 30;
    groundMat.diffuseTexture.vScale = 30;
    groundMat.specularColor = new Color3(.1, .1, .1);
    ground.material = groundMat;

    // UI
    const advTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const instructions = new TextBlock();
    instructions.text = 'Move WASD keys, B for Samba, look with the mouse';
    instructions.color = 'white';
    instructions.fontSize = 16;
    instructions.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    instructions.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    advTexture.addControl(instructions);

    // 键盘消息
    const inputMap = {};
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function(evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
      })
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function(evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
      })
    );

    // 角色
    SceneLoader.ImportMesh('', 'https://assets.babylonjs.com/meshes/', 'HVGirl.glb', scene,
      function(newMeshes, particleSystem, skeletons, animationGroup){
        const hero = newMeshes[0];
        hero.scaling.scaleInPlace(0.1);
        camera.target = hero.position;
        // const sambaAnim = scene.getAnimationGroupByName('Samba');
        // sambaAnim?.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);

        // 基本的角色参数
        const heroSpeed = 0.03;
        const heroSpeedBackwords = 0.01;
        const heroRotationSpeed = 0.1;

        let animating = true;

        const walkAnim = scene.getAnimationGroupByName('Walking');
        const walkBackAnim = scene.getAnimationGroupByName('WalkingBack');
        const idleAnim = scene.getAnimationGroupByName('Idle');
        const sambaAnim = scene.getAnimationGroupByName('Samba');

        // 循环渲染
        scene.onBeforeRenderObservable.add(() => {
          let keydown = false;
          if (inputMap['w']) {
            hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
            keydown = true;
          }
          if (inputMap['s']) {
            hero.moveWithCollisions(hero.forward.scaleInPlace(-heroSpeedBackwords));
            keydown = true;
          }
          if (inputMap['a']) {
            hero.rotate(Vector3.Up(), -heroRotationSpeed);
            keydown = true;
          }
          if (inputMap['d']) {
            hero.rotate(Vector3.Up(), heroRotationSpeed);
            keydown = true;
          }
          if (inputMap['b']) {
            keydown = true;
          }


          if (keydown) {
            if (!animating) {
              animating = true;
              if (inputMap['s']) {
                walkBackAnim?.start(true, 1.0, walkBackAnim.from, walkBackAnim.to, false);
              }
              else if (inputMap['b']) {
                sambaAnim?.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
              }
              else {
                walkAnim?.start(true, 1.0, walkAnim.from, walkAnim.to, false);
              }
            }
          }
          else {
            if (animating) {
              idleAnim?.start(true, 1.0, idleAnim.from, idleAnim.to, false);

              sambaAnim?.stop();
              walkAnim?.stop();
              walkBackAnim?.stop();

              animating = false;
            }
          }
        })
      })

    return scene;
  }
}