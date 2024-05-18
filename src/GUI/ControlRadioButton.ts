import { Color3, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, RadioButton, StackPanel, TextBlock } from "babylonjs-gui";

export default class ControlRadioButton {
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
    sphere.position.y = 3;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // GUI
    const colors = new Map([
      ['Red', Color3.Red()],
      ['Green', Color3.Green()],
      ['Blue', Color3.Blue()],
      ['Yellow', Color3.Yellow()],
      ['Magenta', Color3.Magenta()]
    ]);
    const adTexture = AdvancedDynamicTexture.CreateForMesh(ground, 256, 256, false);

    const panel = new StackPanel();
    adTexture.addControl(panel);

    const txt = new TextBlock();
    txt.text = 'Please select one';
    txt.height = '50px';
    txt.color = 'white';
    panel.addControl(txt);

    const addRadio = function(text: string, parent: StackPanel) {
      const btn = new RadioButton();
      btn.width = '20px';
      btn.height = '20px';
      btn.color = 'white';
      btn.background = 'green';

      btn.onIsCheckedChangedObservable.add((state) => {
        if (state) {
          txt.text = 'You selected ' + text;
          txt.color = text;
          light.diffuse = colors.get(text)!;
        }
      });

      const header = Control.AddHeader(btn, text, '100px', { isHorizontal: true, controlFirst: true });
      header.height = '30px';
      header.color = 'white';

      parent.addControl(header);
    }

    addRadio('Red', panel);
    addRadio('Green', panel);
    addRadio('Blue', panel);
    addRadio('Yellow', panel);
    addRadio('Magenta', panel);

    scene.registerBeforeRender(() => {
      ground.rotation.y += 0.01;
    });

    return scene;
  }
}