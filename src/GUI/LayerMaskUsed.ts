import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, Tools, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";
// import 'babylonjs-loaders';

export default class LayerMaskUsed {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.layerMask = 1;

    const camera2 = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera2.layerMask = 2;

    scene.activeCameras = [camera2, camera];

    const light = new PointLight('light', new Vector3(0, 1, 0), scene);
    light.position = camera.position;

    let skull: Mesh;
    SceneLoader.ImportMesh(
      '',
      'https://playground.babylonjs.com/scenes/',
      'skull.babylon',
      scene,
      (meshes) => {
        camera.target = meshes[0].position;
        skull = meshes[0] as Mesh;
        skull.layerMask = 1;
      }
    );

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    adt.layer!.layerMask = 2;

    const panel = new StackPanel();
    panel.width = '200px';
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    adt.addControl(panel);

    const txt = new TextBlock();
    txt.text = 'Y-rotation: 0 deg';
    txt.height = '30px';
    txt.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    txt.color = 'white';
    panel.addControl(txt);

    const slider = new Slider();
    slider.minimum = 0;
    slider.maximum = 2 * Math.PI;
    slider.value = 0;
    slider.height = '20px';
    slider.onValueChangedObservable.add((value) => {
      txt.text = `Y-rotation: ${Tools.ToDegrees(value) | 0} deg`;
      if (skull) {
        skull.rotation.y = value;
      }      
    });
    panel.addControl(slider);

    const checkbox = new Checkbox();
    checkbox.width = '20px';
    checkbox.height = '20px';
    checkbox.isChecked = true;
    checkbox.color = 'green';
    checkbox.onIsCheckedChangedObservable.add((value) => {
      skull.useVertexColors = value;
      if (value) {
        scene.activeCameras?.push(camera);
      } else {
        scene.activeCameras?.pop();
      }
    });
    // panel.addControl(checkbox);
    const header = Checkbox.AddHeader(checkbox, 'use vertex colors', '180px', {isHorizontal: true, controlFirst: true});
    header.width = '180px';
    header.height = '50px';
    header.color = 'white';
    header.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.addControl(header);

    // const txt = new TextBlock();
    // txt.text = 'use vertex colors';
    // txt.width = '180px';
    // txt.paddingLeft = '5px';
    // txt.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    // txt.color = 'white';
    // panel.addControl(txt);
    
    return scene;
  }
}