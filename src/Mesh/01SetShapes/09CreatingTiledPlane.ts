import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class CreatingTiledPlane {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Creating A Tiled Plane'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/tile1.jpg')

    // const pat = Mesh.NO_FLIP
    const pat = Mesh.FLIP_TILE
    const tiledPlane = MeshBuilder.CreateTiledPlane('tiledPlane', {
      sideOrientation: Mesh.DOUBLESIDE,
      pattern: pat,
      width: 8,
      height: 4, 
      tileSize: 1,
      tileWidth: 2
    })
    tiledPlane.material = mat

    return scene;
  }
}