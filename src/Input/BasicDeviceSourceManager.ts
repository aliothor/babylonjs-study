import { ArcRotateCamera, DeviceSourceManager, DeviceType, Engine, HemisphericLight, MeshBuilder, PointerInput, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class BasicDeviceSourceManager {
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const conn = new TextBlock();
    conn.text = 'Connected:\nnone';
    conn.color = 'white';
    conn.fontSize = 24;
    conn.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    conn.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    conn.width = .5;
    conn.height = .3;
    adt.addControl(conn);

    const disconn = new TextBlock();
    disconn.text = 'Disconnected:\nnone';
    disconn.color = 'white';
    disconn.fontSize = 24;
    disconn.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    disconn.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
    disconn.width = .5;
    disconn.height = .3;
    adt.addControl(disconn);
    
    const input = new TextBlock();
    input.text = 'Press keyboard or mouse';
    input.color = 'white';
    input.fontSize = 24;
    input.width = .5;
    input.height = .3;
    adt.addControl(input);

    // device
    const dsManager = new DeviceSourceManager(this.engine);

    dsManager.onDeviceConnectedObservable.add((ds) => {
      conn.text = `Connected:\n${DeviceType[ds.deviceType]}`;

      if (ds.deviceType == DeviceType.Mouse || ds.deviceType == DeviceType.Touch) {
        ds.onInputChangedObservable.add((data) => {
          if (data.inputIndex != PointerInput.Move) {
            input.text = `onInputChangedObservable inputIndex\n${DeviceType[ds.deviceType]}(${PointerInput[data.inputIndex]})`;
          }
        });
      } else if (ds.deviceType == DeviceType.Keyboard) {
        ds.onInputChangedObservable.add((data) => {
          input.text = `onInputChangedObservable inputIndex\n${DeviceType[ds.deviceType]}(${data.inputIndex})`;
        });
      }
    });

    dsManager.onDeviceDisconnectedObservable.add((ds) => {
      disconn.text = `Disconnected:\n${DeviceType[ds.deviceType]}`;
    });

    return scene;
  }
}