import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, Image, Rectangle, ScrollViewer } from "babylonjs-gui";

export default class ControlScrollViewer {
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
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const sv = new ScrollViewer();
    sv.width = 0.4;
    sv.height = 0.4;
    sv.background = '#CCCCCC';
    adt.addControl(sv);

    const rc = new Rectangle();
    rc.width = 2;
    rc.height = 2;
    rc.thickness = 10;
    rc.color = 'red';
    rc.background = 'yellow';
    rc.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rc.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    sv.addControl(rc);
    sv.horizontalBar.value = 0.5;
    sv.verticalBar.value = 0.5;

    const img = new Image('img', 'https://playground.babylonjs.com/textures/Logo.png');
    img.width = 0.4;
    img.height = 0.4;
    rc.addControl(img);

    return scene;
  }
}