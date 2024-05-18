import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Image } from "babylonjs-gui";

export default class ControlSVGAsset {
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
    const adTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const scal_f = 4.0;

    const b1 = new Image('b1', `GUI/bjs_demo1.svg#bjs_button_bg`);
    b1.onSVGAttributesComputedObservable.add(() => {
      console.log(b1.sourceWidth);
      b1.width = String(b1.sourceWidth * 5.5) + 'px';
      b1.height = String(b1.sourceHeight * 5.5) + 'px';
    });
    b1.stretch = Image.STRETCH_UNIFORM;
    b1.color = 'white';

    const tb1 = Button.CreateImageOnlyButton('tb1', `GUI/bjs_demo1.svg#bjs_button_off`);    
    tb1.image!.onSVGAttributesComputedObservable.add(() => {
      console.log(tb1.image?.sourceWidth);
      tb1.width = String(tb1.image!.sourceWidth * scal_f) + 'px';
      tb1.height = String(tb1.image!.sourceHeight * scal_f) + 'px';
    });
    tb1.image!.stretch = Image.STRETCH_UNIFORM;
    tb1.color = 'transparent';
    tb1.delegatePickingToChildren = true;
    tb1.image!.detectPointerOnOpaqueOnly = true;
    tb1.onPointerUpObservable.add(() => {
      tb1.isVisible = false;
      tb2.isVisible = true;
    });

    const tb2 = Button.CreateImageOnlyButton('tb2', `GUI/bjs_demo1.svg#bjs_button_on`);
    tb2.image!.onSVGAttributesComputedObservable.add(() => {
      console.log(tb2.image?.sourceWidth);
      tb2.width = String(tb2.image!.sourceWidth * scal_f) + 'px';
      tb2.height = String(tb2.image!.sourceHeight * scal_f) + 'px';
    });
    tb2.image!.stretch = Image.STRETCH_UNIFORM;
    tb2.color = 'transparent';
    tb2.delegatePickingToChildren = true;
    tb2.image!.detectPointerOnOpaqueOnly = true;
    tb2.isVisible = false;
    tb2.onPointerUpObservable.add(() => {
      tb2.isVisible = false;
      tb1.isVisible = true;
    });

    adTexture.addControl(b1);
    adTexture.addControl(tb1);
    adTexture.addControl(tb2);

    return scene;
  }
}