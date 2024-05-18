import { ArcRotateCamera, Engine, GamepadManager, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3, Xbox360Button, Xbox360Pad } from "babylonjs";
import { AdvancedDynamicTexture, StackPanel, TextBlock } from "babylonjs-gui";

export default class GamepadExample {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const panel = new StackPanel();
    panel.isVertical = true;
    panel.color = 'white';
    adt.addControl(panel);

    let txtConn = new TextBlock('connection', '');
    txtConn.height = '30px';
    panel.addControl(txtConn);

    let txtButton = new TextBlock('button', '');
    txtButton.height = '30px';
    panel.addControl(txtButton);

    let txtTrigger = new TextBlock('trigger', '');
    txtTrigger.height = '30px';
    panel.addControl(txtTrigger);

    let txtStick = new TextBlock('stick', 'stick');
    txtStick.height = '30px';
    panel.addControl(txtStick);

    // gamepad
    const gpManager = new GamepadManager();

    gpManager.onGamepadConnectedObservable.add((gamepad, state) => {
      txtConn.text = 'Connected: ' + gamepad.id;

      // types
      if (gamepad instanceof Xbox360Pad) {
        gamepad.onButtonDownObservable.add((button, state) => {
          txtButton.text = Xbox360Button[button] + ' pressed';
        });
        gamepad.onButtonUpObservable.add((button, state) => {
          txtButton.text = Xbox360Button[button] + ' released';
        });
      }

      // stick events
      gamepad.onleftstickchanged((values) => {
        txtStick.text = 'x:' + values.x.toFixed(3) + ' y:' + values.y.toFixed(3);
      });
      gamepad.onrightstickchanged((values) => {
        txtStick.text = 'x:' + values.x.toFixed(3) + ' y:' + values.y.toFixed(3);
      });
    });

    return scene;
  }
}