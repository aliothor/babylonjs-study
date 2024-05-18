import { Animation, AnimationEvent, ArcRotateCamera, BezierCurveEase, CircleEase, Color3, EasingFunction, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class EasingAnimation {
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

    const camera = new ArcRotateCamera('camera', 0, Math.PI / 4, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(0, 100, 100), scene);

    const torusMat = new StandardMaterial('torusMat');
    torusMat.diffuseColor = Color3.Green();

    // 普通动画
    const torus0 = MeshBuilder.CreateTorus('torus0', {diameter: 8, thickness: 2, tessellation: 32});
    torus0.position.x = 25;
    torus0.position.z = 30;
    torus0.material = torusMat;

    Animation.CreateAndStartAnimation('anim', torus0, 'position', 30, 120,
      torus0.position, torus0.position.add(new Vector3(-80, 0, 0)));

    // 根据预定义功能创建缓动动画
    const torus1 = MeshBuilder.CreateTorus('torus1', {diameter: 8, thickness: 2, tessellation: 32});
    torus1.position.x = 25;
    torus1.position.z = 0;

    const funAnim = new Animation('funAnim', 'position', 30, 
      Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);

    let keys = [];
    keys.push({
      frame: 0,
      value: torus1.position
    });
    keys.push({
      frame: 120,
      value: torus1.position.add(new Vector3(-80, 0, 0))
    });
    funAnim.setKeys(keys);

    // 添加缓动动画
    const easingFun = new CircleEase();
    easingFun.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    funAnim.setEasingFunction(easingFun);

    torus1.animations.push(funAnim);
    scene.beginAnimation(torus1, 0, 120, true);

    // 贝塞尔曲线动画
    const torus2 = MeshBuilder.CreateTorus('torus2', {diameter: 8, thickness: 2, tessellation: 32});
    torus2.position.x = 25;
    torus2.position.z = -30;

    const beziAnim = new Animation('beziAnim', 'position', 30, 
      Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
    keys = [];
    keys.push({
      frame: 0,
      value: torus2.position
    });
    keys.push({
      frame: 120,
      value: torus2.position.add(new Vector3(-80, 0, 0))
    });
    beziAnim.setKeys(keys);

    const beziEase = new BezierCurveEase(0.32, -0.73, 0.69, 1.59);
    beziAnim.setEasingFunction(beziEase);

    // 添加动画事件
    const evt = new AnimationEvent(50, () => {
      console.log('50 frame, I an here');
    }, true);
    beziAnim.addEvent(evt);

    torus2.animations.push(beziAnim);
    scene.beginAnimation(torus2, 0, 120, true);


    return scene;
  }
}