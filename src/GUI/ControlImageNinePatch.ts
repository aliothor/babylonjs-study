import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Grid, Image } from "babylonjs-gui";

export default class ControlImageNinePatch {
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

    const grid = new Grid();
    grid.addColumnDefinition(1/3);
    grid.addColumnDefinition(1/3);
    grid.addColumnDefinition(1/3);
    adTexture.addControl(grid);

    const url = 'https://playground.babylonjs.com/textures/';

    const img1 = new Image('img1', `${url}panel_blue2x.9.png`);
    img1.width = '200px';
    img1.height = '300px';
    img1.populateNinePatchSlicesFromImage = true;
    img1.stretch = Image.STRETCH_NINE_PATCH;
    grid.addControl(img1, 0, 0);

    const img2 = new Image('img2', `${url}panel_blue2x.9.inv.png`);
    img2.width = '200px';
    img2.height = '300px';
    img2.populateNinePatchSlicesFromImage = true;
    img2.stretch = Image.STRETCH_NINE_PATCH;
    grid.addControl(img2, 0, 1);

    const img3 = new Image('img3', `${url}panel_blue2x.9.direct.png`);
    img3.width = '200px';
    img3.height = '300px';
    // img3.populateNinePatchSlicesFromImage = true;
    img3.sliceLeft = 10;
    img3.sliceRight = 75;
    img3.sliceTop = 10;
    img3.sliceBottom = 45;
    img3.stretch = Image.STRETCH_NINE_PATCH;
    grid.addControl(img3, 0, 2);

    return scene;
  }
}