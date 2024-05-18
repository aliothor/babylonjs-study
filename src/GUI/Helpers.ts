import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Checkbox, Control, Ellipse, Grid, RadioButton, Slider, StackPanel, TextBlock } from "babylonjs-gui";

export default class Helpers {
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

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const grid = new Grid();
    grid.background = 'black';
    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addRowDefinition(0.5);
    grid.addRowDefinition(0.5);
    adt.addControl(grid);

    const colors = ['red', 'green', 'blue', 'yellow'];
    const ellipses = colors.map((color: string, i: number) => {
      const c = new Ellipse(`circle${i}`);
      c.background = color;
      c.width = '100px';
      c.height = '100px';
      c.thickness = 0;
      grid.addControl(c, 0, i);
      return c;
    });

    // 常规
    const panel = new StackPanel();
    grid.addControl(panel, 1, 1);

    const txt = new TextBlock();
    txt.text = 'Radius: 100';
    txt.width = '200px';
    txt.height = '40px';
    txt.color = 'white';
    txt.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.addControl(txt);

    const slider = new Slider();
    slider.width = '200px';
    slider.height = '20px';
    slider.background = 'gray';
    slider.color = 'magenta';
    slider.minimum = 10;
    slider.maximum = 100;
    slider.value = 100;
    slider.step = 1;
    slider.isThumbClamped = true;
    slider.onValueChangedObservable.add((value) => {
      txt.text = `Radius: ${value}`;
      ellipses.forEach((c) => {
        c.height = String(value) + 'px';
        c.width = String(value) + 'px';
      });
    });
    panel.addControl(slider);

    // 多选
    const panelCheck = new StackPanel();
    grid.addControl(panelCheck, 1, 2);

    const checks = colors.map((color, i) => {
      const check = Checkbox.AddCheckBoxWithHeader(color, (v) => {
        ellipses[i].isVisible = v;
      });
      check.children[0].color = color;
      panelCheck.addControl(check);
      return check;
    });

    // 单选
    const panelRadio = new StackPanel();
    grid.addControl(panelRadio, 1, 3);

    const r1 = RadioButton.AddRadioButtonWithHeader('enable', '', true, (rb, v) => {
      if (v) {
        checks.forEach((c) => {
          c.isEnabled = true;
          c.children[0].color = (c.children[1] as TextBlock).text;
        });
      }
    });
    panelRadio.addControl(r1);

    const r2 = RadioButton.AddRadioButtonWithHeader('disable', '', false, (rb, v) => {
      if (v) {
        checks.forEach((c) => {
          c.isEnabled = false;
          c.children[0].color = 'gray';
        });
      }
    });
    panelRadio.addControl(r2);

    return scene;
  }
}