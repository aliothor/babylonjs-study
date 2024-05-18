import { ArcRotateCamera, Engine, FreeCamera, HemisphericLight, Matrix, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, Ellipse } from "babylonjs-gui";

export default class CustomJoystick {
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

    const camera = new FreeCamera('camera', new Vector3(0, 3, -8));
    camera.attachControl(this.canvas, true);
    camera.setTarget(Vector3.Zero());

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const boxMat = new StandardMaterial('boxMat');
    boxMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/crate.png');
    const box = MeshBuilder.CreateBox('box');
    box.material = boxMat;
    box.position.y = 0.5;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6});

    // 
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    let xAddPos = 0;
    let yAddPos = 0;
    let xAddRot = 0;
    let yAddRot = 0;
    let sideJoystickOffset = 150;
    let bottomJoystickOffset = -50;
    let translateTransform;

    // 大圈
    let leftThumbContainer = this._makeThumbArea('leftThumb', 2, 'blue', '');
    leftThumbContainer.height = '200px';
    leftThumbContainer.width = '200px';
    leftThumbContainer.isPointerBlocker = true;
    leftThumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftThumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThumbContainer.alpha = 0.4;
    leftThumbContainer.left = sideJoystickOffset;
    leftThumbContainer.top = bottomJoystickOffset;
    adt.addControl(leftThumbContainer);

    // 小圈
    let leftInnerContainer = this._makeThumbArea('leftInner', 4, 'blue', '');
    leftInnerContainer.height = '80px';
    leftInnerContainer.width = '80px';
    leftInnerContainer.isPointerBlocker = true;
    leftThumbContainer.addControl(leftInnerContainer);

    // 定位器
    let leftPuck = this._makeThumbArea('leftPuck', 0, 'blue', 'blue');
    leftPuck.height = '60px';
    leftPuck.width = '60px';
    leftPuck.isPointerBlocker = true;
    leftPuck.isVisible = false;
    leftThumbContainer.addControl(leftPuck);

    // 摇杆，左
    leftThumbContainer.onPointerDownObservable.add((coordinate) => {
      leftPuck.isVisible = true;
      leftPuck.left = coordinate.x - leftThumbContainer._currentMeasure.width * 0.5 - sideJoystickOffset;
      leftPuck.top = coordinate.y + leftThumbContainer._currentMeasure.height * 0.5 - adt.getSize().height - bottomJoystickOffset;
      leftThumbContainer.alpha = 0.9;
    });

    leftThumbContainer.onPointerUpObservable.add(() => {
      xAddPos = 0;
      yAddPos = 0;
      leftPuck.isVisible = false;
      leftThumbContainer.alpha = 0.4;
    });

    leftThumbContainer.onPointerMoveObservable.add((coordinate) => {
      if (leftPuck.isVisible) {
        xAddPos = coordinate.x - leftThumbContainer._currentMeasure.width * 0.5 - sideJoystickOffset;
        yAddPos = coordinate.y + leftInnerContainer._currentMeasure.height * 0.5 - adt.getSize().height - bottomJoystickOffset;
        leftPuck.left = xAddPos;
        leftPuck.top = yAddPos;
      }   
    });

    scene.registerBeforeRender(() => {
      const trans = Vector3.TransformCoordinates(
        new Vector3(xAddPos/3000, 0, yAddPos/3000),
        Matrix.RotationY(camera.rotation.y)
      );
      camera.cameraDirection.addInPlace(trans);
      camera.cameraRotation.y += xAddRot/15000 * -1;
      camera.cameraRotation.x += yAddRot/15000 * -1;
    });

    return scene;
  }

  private _makeThumbArea(name: string, thickness: number, color: string, background: string) {
    const c = new Ellipse();
    c.name  = name;
    c.thickness = thickness;
    c.color = color;
    c.background = background;
    c.paddingLeft = '0px';
    c.paddingRight = '0px';
    c.paddingTop = '0px';
    c.paddingBottom = '0px';

    return c;
  }
}