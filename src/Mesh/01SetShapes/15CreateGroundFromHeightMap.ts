import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class CreateGroundFromHeightMap {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Ground From a HeightMap'
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

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    const ground = MeshBuilder.CreateGroundFromHeightMap('gfhm', 'https://playground.babylonjs.com/textures/heightMap.png', {
      width: 5,
      height: 5,
      subdivisions: 500
    })

    return scene;
  }
}