import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, DisplayGrid } from "babylonjs-gui";

export default class ControlDisplayGrid {
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

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const dg = new DisplayGrid();
    // dg.width = '500px';
    // dg.height = '300px';
    dg.majorLineColor = 'purple';
    dg.minorLineColor = 'blue';
    dg.majorLineFrequency = 10;
    adt.addControl(dg);

    return scene;
  }
}