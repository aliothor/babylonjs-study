import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { GUI3DManager, NearMenu, TouchHolographicButton } from "babylonjs-gui";
import 'babylonjs-loaders';

export default class StereoNearmenu {
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
    camera.minZ = 0.1;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    // 3D GUI
    const manager = new GUI3DManager();
    manager.useRealisticScaling = true;

    const near = new NearMenu('near');
    manager.addControl(near);
    // near.isPinned = true;
    near.position.z = -6;
    near.rows = 2;

    const addMenu = function(index: number) {
      const btn = new TouchHolographicButton(`btn${index}`);
      btn.imageUrl = 'https://playground.babylonjs.com/textures/down.png';
      btn.text = `Button #${index}`;
      near.addButton(btn);
    }

    for (let i = 0; i < 5; i++) {
      addMenu(i);
    }

    return scene;
  }
}