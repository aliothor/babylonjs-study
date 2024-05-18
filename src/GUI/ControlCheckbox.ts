import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control, StackPanel, TextBlock } from "babylonjs-gui";
// import 'babylonjs-loaders';

export default class ControlCheckbox {
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
    panel.isVertical = false;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    adt.addControl(panel);

    const checkbox = new Checkbox();
    checkbox.width = '20px';
    checkbox.height = '20px';
    checkbox.isChecked = true;
    checkbox.color = 'green';
    checkbox.onIsCheckedChangedObservable.add((value) => {
      skull.useVertexColors = value;
    });
    panel.addControl(checkbox);

    const txt = new TextBlock();
    txt.text = 'use vertex colors';
    txt.width = '180px';
    txt.paddingLeft = '5px';
    txt.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    txt.color = 'white';
    panel.addControl(txt);
    
    return scene;
  }
}