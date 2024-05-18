import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, MultiLine } from "babylonjs-gui";

export default class ControlMultiLine {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // 网格实体
    const positons = [
      new Vector3(-3, 0, 0),
      new Vector3(-2, 0, 1),
      new Vector3(-1, -3, 0),
      new Vector3(0, 0, 0),
      new Vector3(1, 1, 0),
      new Vector3(2, 2, 4),
      new Vector3(3, 0, -2)
    ];

    const spheres = positons.map((position, index) => {
      const sphere = MeshBuilder.CreateSphere(`sphere${index}`);
      sphere.position = position;
      return sphere;
    });

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const btn = Button.CreateSimpleButton('btn', 'Button');
    btn.width = '100px';
    btn.height = '50px';
    btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    btn.left = '30%';
    btn.top = '30px';
    adt.addControl(btn);

    const line = new MultiLine();
    line.add(btn);
    line.add(...spheres);
    line.add({x: '50px', y: '50%'}, btn);
    adt.addControl(line);

    return scene;
  }
}