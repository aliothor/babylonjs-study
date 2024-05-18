import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, Tools, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";
// import 'babylonjs-loaders';

export default class ControlSlider {
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
      }
    );

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const panel = new StackPanel();
    panel.width = '200px';
    // panel.isVertical = false;
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
    
    return scene;
  }
}