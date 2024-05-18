import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, StackPanel, TextBlock } from "babylonjs-gui";

export default class ObservablesExample {
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

    // 
    const panel = new StackPanel();
    adTexture.addControl(panel);

    const button = Button.CreateSimpleButton('button', 'Click Me');
    button.width = '150px';
    button.height = '40px';
    button.color = 'white';
    button.background = 'green';
    button.cornerRadius = 20;
    panel.addControl(button);

    const txt = new TextBlock('txt', '');
    txt.width = 0.2;
    txt.height = '40px';
    txt.color = 'white';
    panel.addControl(txt);

    button.onPointerDownObservable.add(() => {
      txt.text = 'Down';
    });
    button.onPointerUpObservable.add(() => {
      txt.text = 'Up';
    });
    button.onPointerEnterObservable.add(() => {
      txt.text = 'Enter';
    });
    button.onPointerOutObservable.add(() => {
      txt.text = 'Out';
    });
    button.onPointerMoveObservable.add((data) => {
      const coordinate = button.getLocalCoordinates(data);
      txt.text = coordinate.x.toFixed(2) + ', ' + coordinate.y.toFixed(2);
    });

    return scene;
  }
}