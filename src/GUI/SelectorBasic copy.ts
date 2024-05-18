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
    
    const ground = MeshBuilder.CreateGround('groiund', {width: 6, height: 6});

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

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

    const orientateY = function(angle: number) {
      box.rotation.y = angle;
    }

    const displayValue = function(value: number) {
      return Tools.ToDegrees(value) | 0;
    }

    const selectBox = new SelectionPanel('sp');
    selectBox.width = '150px';
    selectBox.height = '320px';
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    adt.addControl(selectBox);

    const transformGroup = new CheckboxGroup('Transformation');
    transformGroup.addCheckbox('Small', toSize);
    transformGroup.addCheckbox('High', toPlace);

    const colorGroup = new RadioGroup('Color');
    colorGroup.addRadio('Blue', setColor, true);
    colorGroup.addRadio('Red', setColor);

    const rotateGroup = new SliderGroup('Rotation');
    rotateGroup.addSlider('Angle', orientateY, 'degs', 0, 2 * Math.PI, 0, displayValue);

    selectBox.addGroup(transformGroup);
    selectBox.addGroup(colorGroup);
    selectBox.addGroup(rotateGroup);

    return scene;
  }
}