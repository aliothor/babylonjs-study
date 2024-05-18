import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button } from "babylonjs-gui";

export default class ObservablePointClick {
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

    const button = Button.CreateSimpleButton('button', 'Clicks: 0');
    button.width = '150px';
    button.height = '40px';
    button.color = '#DF7979';
    button.background = '#EB4D4B';
    button.cornerRadius = 20;
    button.thickness = 4;
    button.children[0].color = '#DFF9FB';
    button.children[0].fontSize = 24;
    let clicks = 0;
    button.onPointerClickObservable.add(() => {
      clicks++;
      if (clicks % 2 == 0) {
        button.background = '#EB4D4B';
      } else {
        button.background = '#007900';
      }
      button.textBlock!.text = 'Clicks: ' + clicks;
    });
    adTexture.addControl(button);

    return scene;
  }
}