import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { GUI3DManager, HolographicButton, TextBlock, TouchHolographicButton } from "babylonjs-gui";

export default class StereoHolographicButton {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    // 3D GUI
    const manager = new GUI3DManager();

    const btn = new HolographicButton('down');
    // const btn = new TouchHolographicButton('down');
    manager.addControl(btn);

    btn.position.z = -3;
    btn.text = 'Rotate';
    btn.imageUrl = 'https://playground.babylonjs.com/textures/down.png';
    const txt = new TextBlock();
    txt.text = 'Reset';
    txt.color = 'red';
    txt.fontSize = 48;
    btn.content = txt;
    btn.onPointerUpObservable.add(() => {
      box.rotation.x -= 0.05;
    });

    return scene;
  }
}