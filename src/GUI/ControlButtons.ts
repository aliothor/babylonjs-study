import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, StackPanel } from "babylonjs-gui";

export default class ControlButtons {
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

    const button = Button.CreateSimpleButton('button', 'Click Me');
    button.width = '150px';
    button.height = '40px';
    button.color = 'white';
    button.background = 'green';
    button.cornerRadius = 20;
    panel.addControl(button);

    const button2 = Button.CreateImageButton('button', 'Click Me', 'https://playground.babylonjs.com/textures/grass.png');
    button2.width = '150px';
    button2.height = '40px';
    button2.color = 'white';
    button2.background = 'green';
    button2.cornerRadius = 20;
    button2.textBlock!.text = 'Changed';
    panel.addControl(button2);

    const button3 = Button.CreateImageWithCenterTextButton('button', 'Click Me', 'https://playground.babylonjs.com/textures/grass.png');
    button3.width = '150px';
    button3.height = '40px';
    button3.color = 'white';
    button3.background = 'green';
    button3.cornerRadius = 20;
    panel.addControl(button3);

    const button4 = Button.CreateImageOnlyButton('button', 'https://playground.babylonjs.com/textures/grass.png');
    button4.width = '150px';
    button4.height = '40px';
    button4.color = 'white';
    button4.background = 'green';
    button4.cornerRadius = 20;
    panel.addControl(button4);

    return scene;
  }
}