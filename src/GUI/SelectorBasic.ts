import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Tools, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, CheckboxGroup, Control, RadioGroup, SelectionPanel, SliderGroup } from "babylonjs-gui";

export default class SelectorBasic {
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
    light.intensity = 0.7;

    const boxMat = new StandardMaterial('boxMat');
    boxMat.emissiveColor = Color3.Blue();
    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position.y = 1;
    box.material = boxMat;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6});

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    // 一些辅助函数
    const toSize = function(isChecked: boolean) {
      if (isChecked) {
        box.scaling = new Vector3(0.5, 0.5, 0.5);
      } else {
        box.scaling = new Vector3(1, 1, 1);
      }
    }

    const toPlace = function(isChecked: boolean) {
      if (isChecked) {
        box.position.y = 2;
      } else {
        box.position.y = 1;
      }
    }

    const setColor = function(but: number) {
      switch(but) {
        case 0:
          boxMat.emissiveColor = Color3.Blue();
          break;
        case 1:
          boxMat.emissiveColor = Color3.Red();
          break;
      }
    }

    const orientateY = function(v: number) {
      box.rotation.y = v;
    }

    const displayValue = function(v: number) {
      return Tools.ToDegrees(v) | 0;
    }

    // 变换
    const transformGroup = new CheckboxGroup('Transformation');
    transformGroup.addCheckbox('Small', toSize);
    transformGroup.addCheckbox('High', toPlace);

    // 颜色
    const colorGroup = new RadioGroup('Color');
    colorGroup.addRadio('Blue', setColor, true);
    colorGroup.addRadio('Red', setColor);

    // 旋转
    const rotateGroup = new SliderGroup('Rotation');
    rotateGroup.addSlider('Angle', orientateY, 'degs', 0, 2 * Math.PI, 0, displayValue);

    const selectBox = new SelectionPanel('sp', [transformGroup, colorGroup, rotateGroup]);
    selectBox.width = '150px';
    selectBox.height = '320px';
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(selectBox);

    // 风格设置
    selectBox.fontSize = '16pt';
    selectBox.color = 'white';
    // selectBox.labelColor = 'white';
    selectBox.background = 'green';
    selectBox.headerColor = 'yellow';
    selectBox.buttonColor = 'orange';
    selectBox.barColor = 'red';
    selectBox.buttonBackground = '#684502';
    selectBox.alpha = 0.8;

    // 更改标签
    selectBox.setHeaderName('Move', 0);
    selectBox.relabel('Theta', 2, 0);

    const toLeft = function(isChecked: boolean) {
      if (isChecked) {
        box.position.x = -2;
      } else {
        box.position.x = 0;
      }
    }
    // 组
    transformGroup.removeSelector(0);
    transformGroup.addCheckbox('Across', toLeft);

    // 面板
    // selectBox.addGroup(transformGroup);
    selectBox.removeGroup(2);
    selectBox.removeFromGroupSelector(0, 0);

    return scene;
  }
}