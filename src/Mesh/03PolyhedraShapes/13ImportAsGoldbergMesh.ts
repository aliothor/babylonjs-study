import { ArcRotateCamera, Color4, Engine, GoldbergMesh, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector2, Vector3 } from "babylonjs";

export default class ImportAsGoldbergMesh {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Import As a Goldberg Mesh'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    SceneLoader.ImportMeshAsync('', 'https://assets.babylonjs.com/meshes/', 'GoldbergScene.babylon').then(result => {
      const g = result.meshes[0] as GoldbergMesh

      for (let f = 12; f < 12 + g.goldbergData.nbFacesAtPole; f++) {
        const box = MeshBuilder.CreateBox('', {height: 1, size: 0.015})
        g.placeOnGoldbergFaceAt(box, f, new Vector3(0, 0.55, 0))
      }

      const radius = 1 / 2
      let center = new Vector2(1 / 2, 1 / 2)
      const uvSet = []
      uvSet.push([0, g.goldbergData.nbUnsharedFaces + g.goldbergData.nbSharedFaces - 1, center.clone(), radius, 0])

      center.x = 1 / 8
      center.y = 1 / 8
      uvSet.push([0, 11, center.clone(), 1 / 8, 0])
      g.setGoldbergFaceUVs(uvSet)
      g.setGoldbergFaceColors([[0, 11, new Color4(0, 0, 1, 1)]])

      const mat = new StandardMaterial('')
      mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/redarrow.jpg')
      g.material = mat
    })

    return scene;
  }
}