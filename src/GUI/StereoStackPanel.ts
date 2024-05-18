import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { Button3D, GUI3DManager, StackPanel3D, TextBlock } from "babylonjs-gui";

export default class StereoStackPanel {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    // 3D GUI
    const manager = new GUI3DManager();

    const panel = new StackPanel3D();
    panel.margin = 0.05;

    manager.addControl(panel);
    panel.position.z = -1.5;

    const addButton = function() {
      const btn = new Button3D('orientation');
      panel.addControl(btn);
      btn.onPointerUpObservable.add(() => {
        panel.isVertical = !panel.isVertical;
      });

      const txt = new TextBlock();
      txt.text = 'change orientation';
      txt.color = 'white';
      txt.fontSize = 24;
      btn.content = txt;
    }

    addButton();
    addButton();
    addButton();


    return scene;
  }
}