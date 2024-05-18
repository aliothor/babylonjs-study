import {
  AnimationRange,
  ArcRotateCamera,
  BakedVertexAnimationManager,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Vector3,
  VertexAnimationBaker,
} from "babylonjs";
import "babylonjs-loaders";

export default class BakevertexAnimation {
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
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 2;

    const animRanges = [
      { from: 7, to: 31 },
      { from: 33, to: 61 },
      { from: 63, to: 91 },
      { from: 93, to: 130 },
    ];

    // 'https://raw.githubusercontent.com/RaggarDK/Baby/baby/
    let baker: VertexAnimationBaker, mesh: Mesh;
    SceneLoader.ImportMeshAsync("", "/Animation/", "arr.babylon")
      .then((result) => {
        console.log(result, "===================");
        mesh = result.meshes[0] as Mesh;
        // mesh.scaling = new Vector3(0.08, 0.08, 0.08);
        baker = new VertexAnimationBaker(scene, mesh);

        return baker.bakeVertexData([
          new AnimationRange("My animation", 0, 130),
        ]);
      })
      .then((vertexData) => {
        const vertexTexture = baker.textureFromBakedVertexData(vertexData);
        const manager = new BakedVertexAnimationManager(scene);
        manager.texture = vertexTexture;
        manager.setAnimationParameters(
          animRanges[0].from,
          animRanges[0].to,
          0,
          30
        );

        mesh.bakedVertexAnimationManager = manager;

        scene.registerBeforeRender(() => {
          manager.time += this.engine.getDeltaTime() / 1000.0;
        });
      });

    return scene;
  }
}
