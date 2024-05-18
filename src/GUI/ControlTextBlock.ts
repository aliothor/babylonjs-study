import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button } from "babylonjs-gui";

export default class ControlTextBlock {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
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

    // GUI
    const adTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    adTexture.rootContainer.scaleX = window.devicePixelRatio;
    adTexture.rootContainer.scaleY = window.devicePixelRatio;

    const button = Button.CreateSimpleButton('button', 'Click Me');
    button.width = '150px';
    button.height = '40px';
    button.color = 'black';
    button.background = 'white';
    button.thickness = 0;
    button.fontSize = '20px';
    adTexture.addControl(button);

    // HTML div
    const div = document.createElement('div');
    const content = document.createTextNode('Click Me');
    div.appendChild(content);

    div.style.position = 'absolute';
    div.style.left = '50%';
    div.style.top = '60%';
    div.style.background = 'white';
    div.style.fontSize = '20px';
    document.body.appendChild(div);

    return scene;
  }
}