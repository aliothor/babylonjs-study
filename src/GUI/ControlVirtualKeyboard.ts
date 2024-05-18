import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, InputText, VirtualKeyboard } from "babylonjs-gui";

export default class ControlVirtualKeyboard {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 网格
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const input = new InputText();
    input.width = 0.5;
    input.height = '40px';
    input.maxWidth = 0.5;
    input.color = 'white';
    input.background = 'green';
    adt.addControl(input);

    // const keyboard = new VirtualKeyboard();
    // keyboard.addKeysRow(['7', '8', '9']);
    // keyboard.addKeysRow(['4', '5', '6']);
    // keyboard.addKeysRow(['1', '2', '3']);
    // keyboard.addKeysRow(['0', '.'], [{width: '80px'}, {}]);
    const keyboard = VirtualKeyboard.CreateDefaultLayout();
    keyboard.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    keyboard.connect(input);
    adt.addControl(keyboard);

    return scene;
  }
}