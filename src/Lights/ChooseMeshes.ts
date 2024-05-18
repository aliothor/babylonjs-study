import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class ChooseMeshes {
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

    const light1 = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    light1.diffuse = new Color3(1, 0, 0);
    light1.specular = new Color3(0, 1, 0);
    light1.groundColor = new Color3(0, 1, 0);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.5});

    const s = [];
    for (let i = 0; i < 25; i++) {
      s[i] = sphere.clone('sphere' + i);
      s[i].position.x = 2 - i % 5;
      s[i].position.y = 2 - Math.floor(i / 5);
    }

    light.includedOnlyMeshes.push(s[7], s[18], s[15]);
    light1.excludedMeshes.push(s[7], s[18], s[10]);

    return scene;
  }
}