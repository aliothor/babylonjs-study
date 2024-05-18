import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Line } from "babylonjs-gui";

export default class ControlLine {
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

    const line = new Line();
    line.x1 = 20,
    line.y1 = 10;
    line.x2 = 800;
    line.y2 = 350;
    line.lineWidth = 5;
    line.color = 'white';
    line.dash = [5, 10];
    adTexture.addControl(line);

    return scene;
  }
}