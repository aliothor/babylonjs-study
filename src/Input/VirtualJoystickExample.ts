import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3, VirtualJoystick } from "babylonjs";

export default class VirtualJoystickExample {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box');
    box.position.y = 0.5;

    const ground = MeshBuilder.CreateGround('ground', {width: 10, height: 10});

    const leftJoystick = new VirtualJoystick(true);
    const rightJoystick = new VirtualJoystick(false);
    VirtualJoystick.Canvas!.style.zIndex = '5';

    const movespeed = 5;
    let moveX, moveY, moveZ;
    scene.onBeforeRenderObservable.add(() => {
      if (leftJoystick.pressed) {
        moveX = leftJoystick.deltaPosition.x * (this.engine.getDeltaTime() / 1000) * movespeed;
        moveZ = leftJoystick.deltaPosition.y * (this.engine.getDeltaTime() / 1000) * movespeed;
        box.position.x += moveX;
        box.position.z += moveZ;
      }
      if (rightJoystick.pressed) {
        moveY = rightJoystick.deltaPosition.y * (this.engine.getDeltaTime() / 1000) * movespeed;
        box.position.y += moveY;
      }
    });

    // 创建页面元素
    const btn = document.createElement('button');
    btn.innerText = 'Enable/Disable Joystick';
    btn.style.zIndex = '10';
    btn.style.position = 'absolute';
    btn.style.bottom = '50px';
    btn.style.right = '200px';
    document.body.appendChild(btn);

    btn.onclick = () => {
      if (VirtualJoystick.Canvas?.style.zIndex == '-1') {
        VirtualJoystick.Canvas.style.zIndex = '5';
      } else {
        VirtualJoystick.Canvas!.style.zIndex = '-1';
      }
    }

    scene.onDisposeObservable.add(() => {
      VirtualJoystick.Canvas!.style.zIndex = '-1';
      document.body.removeChild(btn);
    });


    return scene;
  }
}