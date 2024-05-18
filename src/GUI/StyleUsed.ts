import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, StackPanel, TextBlock } from "babylonjs-gui";

export default class StyleUsed {
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

    // style
    const style = adt.createStyle();
    style.fontSize = 24;
    style.fontStyle = 'bold';

    // panel
    const panel = new StackPanel();
    adt.addControl(panel);

    const txt1 = new TextBlock();
    txt1.text = 'Hello world (no style)';
    txt1.color = 'white';
    txt1.height = '30px';
    txt1.fontSize = 24;
    txt1.fontStyle = 'bold';
    panel.addControl(txt1);

    const txt2 = new TextBlock();
    txt2.text = 'Hello world (with style)';
    txt2.color = 'white';
    txt2.height = '30px';
    txt2.style = style;
    panel.addControl(txt2);

    const txt3 = new TextBlock();
    txt3.text = 'Hello world (with style)';
    txt3.color = 'white';
    txt3.height = '30px';
    txt3.style = style;
    panel.addControl(txt3);

    const button = Button.CreateSimpleButton('button', 'Click Me');
    button.width = '150px';
    button.height = '40px';
    button.color = 'white';
    button.background = 'green';
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(() => {
      style.fontSize = 32;
      style.fontStyle = 'normal';
      style.fontFamily = 'Verdana';
    });
    panel.addControl(button);

    return scene;
  }
}