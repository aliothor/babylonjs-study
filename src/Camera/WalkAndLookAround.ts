import { ArcRotateCamera, Camera, Color3, Engine, FreeCamera, HemisphericLight, ICameraInput, KeyboardInfo, LinesMesh, Matrix, Mesh, MeshBuilder, Nullable, Observer, Scene, SceneLoader, StandardMaterial, Texture, UniversalCamera, Vector3, Viewport } from "babylonjs";

export default class WalkAndLookAround {
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

    // 第一人称视角
    const camera = new UniversalCamera('camera', new Vector3(0, 1, 0));
    camera.minZ = 0.0001;
    camera.speed = 0.02;
    camera.attachControl(this.canvas, true);

    // 第三人称视角
    const viewCamera = new UniversalCamera('viewCamera', new Vector3(0, 8, -8));
    viewCamera.parent = camera;
    viewCamera.setTarget(Vector3.Zero());

    // 添加活动相机
    scene.activeCameras?.push(viewCamera);
    scene.activeCameras?.push(camera);

    // 添加两个视口
    camera.viewport = new Viewport(0, 0.5, 1.0, 0.5);
    viewCamera.viewport = new Viewport(0, 0, 1.0, 0.5);

    // 移除默认输入
    camera.inputs.removeByType('FreeCameraKeyboardMoveInput');
    // camera.inputs.removeByType('FreeCameraMouseInput');

    // 添加新的输入
    camera.inputs.add(new FreeCameraKeyboardRotateInput(0.1));

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround('ground', {width: 30, height: 30});
    const gMat = new StandardMaterial('gMat');
    gMat.diffuseColor = Color3.White();
    gMat.backFaceCulling = false;
    ground.material = gMat;
    ground.position.y = -0.5;

    const bMat = new StandardMaterial('bMat');
    bMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/crate.png');
    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.material = bMat;
    box.checkCollisions = true;

    // 复制场景盒子
    const randNum = function(min: number, max: number) {
      return min + (max - min) * Math.random();
    }

    const boxNum = 6;
    let theta = 0;
    const radius = 6;
    box.position = new Vector3((radius + randNum(-radius / 2, radius / 2)) * Math.cos(theta + randNum(-theta / 10, theta / 10)),
      1,
      (radius + randNum(-radius / 2, radius / 2)) * Math.sin(theta + randNum(-theta / 10, theta / 10)));

    const boxes: Mesh[] = [box];
    for (let i = 1; i < boxNum; i++) {
      theta += 2 * Math.PI / boxNum;
      const newBox = box.clone('box' + i);
      boxes.push(newBox);
      newBox.position = new Vector3((radius + randNum(-radius / 2, radius / 2)) * Math.cos(theta + randNum(-theta / 10, theta / 10)),
        1,
        (radius + randNum(-radius / 2, radius / 2)) * Math.sin(theta + randNum(-theta / 10, theta / 10)));
    }

    // 场景主角
    const base = new Mesh('pviot');
    base.checkCollisions = true;
    base.parent = camera;

    const headDiam = 1.5;
    const bodyDiam = 2;
    const head = MeshBuilder.CreateSphere('h', {diameter: headDiam});
    head.parent = base;
    const body = MeshBuilder.CreateSphere('b', {diameter: bodyDiam});
    body.parent = base;
    head.position.y = 0.5 * (headDiam + bodyDiam);
    base.position.y = 0.5 * bodyDiam;

    // 可视化碰撞盒子
    const extra = 0.25;
    const offsetY = (bodyDiam + headDiam) / 2 - base.position.y;
    base.ellipsoid = new Vector3(bodyDiam / 2, (headDiam + bodyDiam) / 2,bodyDiam / 2);
    base.ellipsoid.addInPlace(new Vector3(extra, extra, extra));
    const a = base.ellipsoid.x;
    const b = base.ellipsoid.y;
    const points: Vector3[] = [];
    for (let i = -Math.PI / 2; i < Math.PI / 2; i += Math.PI / 36) {
      points.push(new Vector3(0, b * Math.sin(i) + offsetY, a * Math.cos(i)));
    }

    const ellipse: LinesMesh[] = [];
    ellipse[0] = MeshBuilder.CreateLines('e', {points: points});
    ellipse[0].color = Color3.Red();
    ellipse[0].parent = base;
    const steps = 12;
    theta = 2 * Math.PI / steps;
    for (let i = 1; i < steps; i++) {
      ellipse[i] = ellipse[0].clone('el' + i);
      ellipse[i].parent = base;
      ellipse[i].rotation.y = i * theta;
    }

    // 方向线
    const forward = new Vector3(0, 0, 1);
    const ptOffsetB = new Vector3(0, headDiam + extra, 0);
    const line = MeshBuilder.CreateLines('dir', {
      points: [base.position.add(ptOffsetB), base.position.add(ptOffsetB.add(forward.scale(3)))]
    });
    line.parent = base;

    // 环境设置
    scene.gravity = new Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1.5, 1, 1.5);

    ground.checkCollisions = true;
    
    return scene;
  }
}


class FreeCameraKeyboardRotateInput implements ICameraInput<UniversalCamera> {
  camera!: UniversalCamera;

  rotateObsv: Nullable<Observer<KeyboardInfo>> = null;

  constructor(public sensility: number) {}

  getClassName(): string {
    return 'FreeCameraKeyboardRotateInput';
  }
  getSimpleName(): string {
    return 'KeyboardRotate';
  }
  attachControl(noPreventDefault?: boolean | undefined): void {
    const scene = this.camera.getScene();
    const direction = Vector3.Zero();
    this.rotateObsv = scene.onKeyboardObservable.add((kbInfo) => {
      // console.log(kbInfo.type);
      switch(kbInfo.event.key) {
        case 'ArrowLeft':
          this.camera.rotation.y -= this.sensility;
          direction.copyFromFloats(0, 0, 0);
          break;
        case 'ArrowRight':
          this.camera.rotation.y += this.sensility;
          direction.copyFromFloats(0, 0, 0);
          break;
        case 'ArrowUp':
          direction.copyFromFloats(0, 0, this.camera.speed);
          break;
        case 'ArrowDown':
          direction.copyFromFloats(0, 0, -this.camera.speed);
          break;
      }
      this.camera.getViewMatrix().invertToRef(this.camera._cameraTransformMatrix);
      Vector3.TransformNormalToRef(
        direction,
        this.camera._cameraTransformMatrix,
        this.camera._transformedDirection
      );
      this.camera.cameraDirection.addInPlace(this.camera._transformedDirection);
    });
  }
  detachControl(): void {
    if (this.rotateObsv) this.camera.getScene().onKeyboardObservable.remove(this.rotateObsv);
  }
  checkInputs?: (() => void) | undefined;
  
}