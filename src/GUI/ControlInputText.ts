import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, InputText, StackPanel } from "babylonjs-gui";

export default class ControlInputText {
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
    const adTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const panel = new StackPanel();
    adTexture.addControl(panel);

    const input = new InputText();
    input.width = 0.2;
    input.maxWidth = 0.2;
    input.height = '40px';
    input.text = '这是一个文本输入框';
    input.color = 'white';
    input.background = 'green';
    input.focusedBackground = 'purple';
    input.hoverCursor = 'text';
    panel.addControl(input);

    const input2 = new InputText();
    input2.width = 0.2;
    input2.maxWidth = 0.2;
    input2.height = '40px';
    input2.text = '';
    input2.color = 'white';
    input2.background = 'green';
    input2.focusedBackground = 'purple';
    input2.hoverCursor = 'text';
    input2.paddingTop = '10px';
    input2.onBeforeKeyAddObservable.add((txt) => {
      const key = txt.currentKey;
      if (key < '0' || key > '9') {
        input2.addKey = false;
      } else {
        input2.addKey = true;
      }
    });
    panel.addControl(input2);

    return scene;
  }
}