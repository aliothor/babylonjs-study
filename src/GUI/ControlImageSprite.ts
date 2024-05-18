import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Image, StackPanel } from "babylonjs-gui";

export default class ControlImageSprite {
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

    let cellFlag = true;

    const button = Button.CreateSimpleButton('button', 'Click Me');
    button.width = '200px';
    button.height = '40px';
    button.color = 'white';
    button.background = 'green';
    button.cornerRadius = 20;
    panel.addControl(button);

    const img = new Image('img', 'https://playground.babylonjs.com/textures/player.png');
    img.width = '100px';
    img.height = '100px';
    img.cellId = 1;
    img.cellHeight = 64;
    img.cellWidth = 64;
    img.sourceHeight = 64;
    img.sourceWidth = 64;
    panel.addControl(img);

    button.onPointerClickObservable.add(() => {
      cellFlag = !cellFlag;
      if (cellFlag) {
        img.cellId = 1;
        button.textBlock!.text = 'Cell Animation';
      } else {
        img.cellId = -1;
        img.sourceLeft = 0;
        button.textBlock!.text = 'Source Animation';
      }
    });

    // 动画
    setInterval(() => {
      if (cellFlag) {
        if (img.cellId < 10) {
          img.cellId++;
        } else {
          img.cellId = 1;
        }
      } else {
        img.sourceLeft += img.sourceWidth;
        if (img.sourceLeft >= 1408) {
          img.sourceLeft = 0;
        }
      }
    }, 50);

    return scene;
  }
}