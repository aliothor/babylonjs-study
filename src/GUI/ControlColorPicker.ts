import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, ColorPicker, Control, StackPanel, TextBlock } from "babylonjs-gui";

export default class ControlColorPicker {
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
    const skullMat = new StandardMaterial('skullMat');
    // 加载
    SceneLoader.ImportMesh(
      '',
      'https://playground.babylonjs.com/scenes/',
      'skull.babylon',
      scene,
      (meshes) => {
        skull = meshes[0] as Mesh;
        camera.target = skull.position;
        skull.material = skullMat;
      }
    );

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const panel = new StackPanel();
    panel.width = '200px';
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    adt.addControl(panel);

    const txt = new TextBlock();
    txt.text = 'Diffuse Color';
    txt.height = '30px';
    txt.color = 'white';
    panel.addControl(txt);

    const picker = new ColorPicker();
    picker.value = skullMat.diffuseColor;
    picker.height = '150px';
    picker.width = '150px';
    picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.onValueChangedObservable.add((value) => {
      skullMat.diffuseColor.copyFrom(value);
      txt.text = value.toHexString();
    });
    panel.addControl(picker);

    return scene;
  }
}