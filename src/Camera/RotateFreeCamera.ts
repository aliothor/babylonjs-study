import { Engine, FreeCamera, HemisphericLight, ICameraInput, KeyboardInfo, MeshBuilder, Nullable, Observer, Scene, Vector3 } from "babylonjs";

export default class RotateFreeCamera {
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

    const camera = new FreeCamera('camera', new Vector3(0, 3, -15));
    camera.inputs.removeByType('FreeCameraKeyboardMoveInput');
    camera.inputs.add(new FreeCameraKeyboardRotateInput(0.01));
    // camera.inputs.attached.KeyboardRotate.sensility = 0.02;
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {height: 6, width: 6, subdivisions: 2});

    return scene;
  }
}

class FreeCameraKeyboardRotateInput implements ICameraInput<FreeCamera> {
  camera!: FreeCamera;

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
    this.rotateObsv = scene.onKeyboardObservable.add((kbInfo) => {
      console.log(kbInfo.event.key);
      switch(kbInfo.event.key) {
        case 'ArrowLeft':
          this.camera.cameraRotation.y += this.sensility;
          break;
        case 'ArrowRight':
          this.camera.cameraRotation.y -= this.sensility;
          break;
        }
    });
  }
  detachControl(): void {
    if (this.rotateObsv) this.camera.getScene().onKeyboardObservable.remove(this.rotateObsv);
  }
  checkInputs?: (() => void) | undefined;
  
}