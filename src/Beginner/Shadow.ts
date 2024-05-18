import {
  ArcRotateCamera,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3
} from "babylonjs";
import "babylonjs-loaders";

export default class Shadow {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      50,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight("dir1", new Vector3(0, -1, 1), scene);
    light.position = new Vector3(0, 15, -30);

    const ground = MeshBuilder.CreateGround("ground", {
      width: 100,
      height: 100,
      subdivisions: 1
    });
    ground.receiveShadows = true;

    const shadowGenerator = new ShadowGenerator(1024, light);

    SceneLoader.ImportMesh(
      "him",
      "https://playground.babylonjs.com/scenes/Dude/",
      "Dude.babylon",
      scene,
      function (newMeshes2, particleSystems2, skeletons2) {
        const dude = newMeshes2[0];
        dude.scaling = new Vector3(0.2, 0.2, 0.2);

        shadowGenerator.addShadowCaster(dude, true);

        scene.beginAnimation(skeletons2[0], 0, 100, true);
      }
    );

    // https://playground.babylonjs.com/scenes/Dude/
    // Dude.babylon

    return scene;
  }
}
