import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Grid, Rectangle } from "babylonjs-gui";

export default class ContainerGrid {
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

    const grid = new Grid();
    grid.background = 'black';
    adt.addControl(grid);

    grid.addColumnDefinition(100, true);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(100, true);
    grid.addRowDefinition(0.5);
    grid.addRowDefinition(0.5);

    let rect = new Rectangle();
    rect.background = 'red';
    rect.thickness = 0;
    grid.addControl(rect, 0, 1);

    rect = new Rectangle();
    rect.background = 'green';
    rect.thickness = 0;
    grid.addControl(rect, 0, 2);

    rect = new Rectangle();
    rect.background = 'blue';
    rect.thickness = 0;
    grid.addControl(rect, 1, 1);

    rect = new Rectangle();
    rect.background = 'yellow';
    rect.thickness = 0;
    grid.addControl(rect, 1, 2);

    return scene;
  }
}