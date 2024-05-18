import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Rectangle, TextBlock } from "babylonjs-gui";

export default class ContainerAdaptativeClip {
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
    adt.useInvalidateRectOptimization = false;

    const rect = new Rectangle();
    rect.width = '200px';
    rect.height = '60px';
    rect.color = 'orange';
    rect.background = 'green';
    rect.cornerRadius = 20;
    rect.thickness = 8;
    rect.adaptWidthToChildren = true;
    rect.isPointerBlocker = true;
    rect.clipChildren = false;
    adt.addControl(rect);

    const txt = new TextBlock();
    txt.text = 'Hello world';
    txt.color = 'white';
    txt.width = '150px';
    txt.fontSize = 24;
    txt.left = '-60px';
    rect.addControl(txt);

    return scene;
  }
}