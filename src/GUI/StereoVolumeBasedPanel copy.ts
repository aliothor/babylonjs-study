import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, TransformNode, Vector3 } from "babylonjs";
import { Button3D, Container3D, CylinderPanel, GUI3DManager, HolographicButton, PlanePanel, ScatterPanel, SpherePanel, StackPanel3D, TextBlock } from "babylonjs-gui";

export default class StereoVolumeBasedPanel {
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
    camera.wheelDeltaPercentage = 0.01;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');
    

    // 3D GUI
    // const anchor = new TransformNode('anchor');
    const manager = new GUI3DManager();
    // const panel = new SpherePanel();
    // const panel = new CylinderPanel();
    // const panel = new PlanePanel();
    const panel = new ScatterPanel();
    panel.margin = 0.2;
    manager.addControl(panel);
   // panel.orientation = Container3D.FACEFORWARD_ORIENTATION;
    // panel.linkToTransformNode(anchor);
    // anchor.position.z = 10;
    panel.position.z = -1.5;
    // panel.radius = 8;
    const addButton = function() {
      const btn = new HolographicButton('orientation');
      panel.addControl(btn);
      btn.text = 'Button #' + panel.children.length;
      
    }
    panel.blockLayout = true;
    for (let i = 0; i < 60; i++) {
      addButton();
    }
    panel.blockLayout = false;
    return scene;
  }
}