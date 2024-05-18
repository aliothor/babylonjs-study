import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";
import { BrickProceduralTexture } from "babylonjs-procedural-textures";

export default class BasicScene {
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
    const mat = new StandardMaterial('mat')
    // mat.diffuseColor = new Color3(.1, .1, .1)
    mat.diffuseTexture = new BrickProceduralTexture('brick', 512)

    box.material = mat

    return scene;
  }
}