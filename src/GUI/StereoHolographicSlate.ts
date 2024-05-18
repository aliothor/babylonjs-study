import { ArcRotateCamera, Color3, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, Texture, Vector2, Vector3 } from "babylonjs";
import { GUI3DManager, HolographicSlate, Image } from "babylonjs-gui";
import { TriPlanarMaterial } from "babylonjs-materials";

export default class StereoHolographicSlate {
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

    const camera = new FreeCamera('camera', new Vector3(42, 3, 8));
    camera.attachControl(this.canvas, true);
    camera.setTarget(new Vector3(31, 3, -3));

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 0.3);
    light.groundColor = new Color3(0.69, 0.87, 0.6);

    // const box = MeshBuilder.CreateBox('box');
    const url = 'https://playground.babylonjs.com/textures/';
    const ground = MeshBuilder.CreateGroundFromHeightMap(
      'ground',
      `${url}heightMap.png`,
      {width: 100, height: 100, subdivisions: 100, maxHeight: 10}
    );
    const gMat = new TriPlanarMaterial('gMat');
    gMat.diffuseTextureX = new Texture(`${url}sand.jpg`);
    gMat.diffuseTextureY = new Texture(`${url}rock.png`);
    gMat.diffuseTextureZ = new Texture(`${url}sand.jpg`);
    ground.material = gMat;

    // 3D GUI
    const manager = new GUI3DManager();

    const slate = new HolographicSlate('down');
    slate.minDimensions = new Vector2(5, 5);
    slate.dimensions = new Vector2(5, 5);
    slate.titleBarHeight = 0.75;
    slate.title = 'Cats!';
    manager.addControl(slate);
    slate.content = new Image('cat', 'https://placekitten.com/300/300');
    slate.position = new Vector3(20, 8, -8);

    return scene;
  }
}