import { ArcRotateCamera, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, PointerEventTypes, Scene, SceneLoader, Texture, Vector3 } from "babylonjs";

export default class Particles {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 70, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);

    const fountainProfile = [
      new Vector3(0, 0, 0),
      new Vector3(10, 0, 0),
      new Vector3(10, 4, 0),
      new Vector3(8, 4, 0),
      new Vector3(8, 1, 0),
      new Vector3(1, 2, 0),
      new Vector3(1, 15, 0),
      new Vector3(3, 17, 0)
    ];

    const fountain = MeshBuilder.CreateLathe('fountain', {
      shape: fountainProfile,
      sideOrientation: Mesh.DOUBLESIDE
    });
    fountain.position.y = -5;

    // https://playground.babylonjs.com/textures/flare.png
    // 喷泉粒子
    const particleSystem = new ParticleSystem('particleSystem', 5000, scene);
    particleSystem.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png');

    // 粒子发射位置
    particleSystem.emitter = new Vector3(0, 10, 0);
    particleSystem.minEmitBox = new Vector3(-0.1, 0, 0);
    particleSystem.maxEmitBox = new Vector3(0.1, 0, 0);

    // 颜色
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0);

    // 尺寸
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    // 粒子生命周期
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 3.5;

    // 发射速率
    particleSystem.emitRate = 1500;

    // 混合模式
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // 重力
    particleSystem.gravity = new Vector3(0, -9.81, 0);

    // 发射方向
    particleSystem.direction1 = new Vector3(-2, 8, 2);
    particleSystem.direction2 = new Vector3(2, 8, -2);

    // 
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // 速度
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.025;

    // 启动
    // particleSystem.start();

    let switched = false;
    scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          if (pointerInfo.pickInfo?.hit) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (pickedMesh === fountain) {
              switched = !switched;
            }
            if (switched) {
              particleSystem.start();
            } else {
              particleSystem.stop();
            }
          }
      }
    });

    return scene;
  }
}