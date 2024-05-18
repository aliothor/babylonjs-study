import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Plane, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class CreatePlane {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Plane'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const plane = MeshBuilder.CreatePlane('plane', {width: 1, height: 2, sideOrientation: Mesh.DOUBLESIDE})

    // const f = new Vector4(0, 0, 0.5, 1)
    // const b = new Vector4(0.5, 0, 1, 1)
    // const plane = MeshBuilder.CreatePlane('plane', {width: 1, height: 1, sideOrientation: Mesh.DOUBLESIDE, frontUVs: f, backUVs: b})
    // const mat = new StandardMaterial('mat')
    // mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/tile1.jpg')
    // plane.material = mat

    const abstractPlane = Plane.FromPositionAndNormal(new Vector3(1, 1, 1), new Vector3(0.2, 0.5, -1))
    const plane = MeshBuilder.CreatePlane('plane', {width: 1, height: 1, sideOrientation: Mesh.DEFAULTSIDE, sourcePlane: abstractPlane})

    return scene;
  }
}