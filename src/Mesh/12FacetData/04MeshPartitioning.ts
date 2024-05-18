import { AbstractMesh, ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class MeshPartitioning {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Mesh Partitioning'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 120, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', camera.position, scene);

    SceneLoader.ImportMesh('', 'https://playground.babylonjs.com/scenes/', 'skull.babylon', scene, function(newMesh) {
      const mesh = newMesh[0]
      mesh.position = Vector3.Zero()
      // mesh.partitioningSubdivisions = 15
      // mesh.partitioningBBoxRatio = 1.20
      // mesh.updateFacetData()
      showPartitioning(mesh, 52)
    })

    function showPartitioning(mesh: AbstractMesh, scaling: number) {
      const octMat = new StandardMaterial('octMat')
      octMat.alpha = 0.2
      octMat.backFaceCulling = false
      octMat.diffuseColor = Color3.Blue()
      octMat.specularColor = Color3.Black()
      const bInfo = mesh.getBoundingInfo()
      const xSpace = (bInfo.maximum.x - bInfo.minimum.x) / mesh.partitioningSubdivisions
      const ySpace = (bInfo.maximum.y - bInfo.minimum.y) / mesh.partitioningSubdivisions

      let plane: Mesh = new Mesh('p')
      for (let x = 0; x <= mesh.partitioningSubdivisions; x++) {
        if (x == 0) {
          plane = MeshBuilder.CreatePlane('px0')
          plane.material = octMat
        } else {
          plane = plane.clone('px' + x)
        }
        plane.position.x = (bInfo.minimum.x + x * xSpace) * mesh.partitioningBBoxRatio
        plane.rotation.y = Math.PI / 2
        plane.scaling.x = scaling * mesh.partitioningBBoxRatio
        plane.scaling.y = scaling * mesh.partitioningBBoxRatio
      }
      for (let y = 0; y <= mesh.partitioningSubdivisions; y++) {
        plane = plane.clone('py' + y)
        plane.position.y = (bInfo.minimum.y + y * ySpace) * mesh.partitioningBBoxRatio
        plane.position.x = 0
        plane.rotation.x = Math.PI / 2
        plane.scaling.x = scaling * mesh.partitioningBBoxRatio
        plane.scaling.y = scaling * mesh.partitioningBBoxRatio
      }
    }

    return scene;
  }
}