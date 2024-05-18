import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Rectangle } from "babylonjs-gui";

export default class AlignmentsExample {
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 网格
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // GUI
    const adTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const createRectangle = function(): Rectangle {
      const rect = new Rectangle();
      rect.width = 0.2;
      rect.height = '40px';
      rect.cornerRadius = 20;
      rect.color = 'Orange';
      rect.thickness = 4;
      rect.background = 'green';
      adTexture.addControl(rect);
      return rect;
    }

    createRectangle().horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    createRectangle().horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

    createRectangle().verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    createRectangle().verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    return scene;
  }
}