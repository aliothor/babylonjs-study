import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, MultiMaterial, Scene, SceneLoader, StandardMaterial, SubMesh, Texture, Vector3 } from "babylonjs";

export default class CreateTiledGround {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Tiled Ground'
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

    const grid = {
      w: 8,
      h: 8
    }
    const tiledGround = MeshBuilder.CreateTiledGround('tiledGround', {
      xmin: -3,
      zmin: -3,
      xmax: 3,
      zmax: 3,
      subdivisions: grid,
      precision: { w: 1, h: 1 }
    })

    // materials
    const mat1 = new StandardMaterial('mat1')
    // mat1.diffuseColor = new Color3(1, 1, 1)
    mat1.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/grass.png')

    const mat2 = new StandardMaterial('mat2')
    // mat2.diffuseColor = new Color3(0, 0, 0)
    mat2.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/rock.png')

    const multiMat = new MultiMaterial('multiMat')
    multiMat.subMaterials.push(mat1)
    multiMat.subMaterials.push(mat2)
    tiledGround.material = multiMat

    const verticesCount = tiledGround.getTotalVertices()
    const tileIndicesLength = tiledGround.getIndices()?.length / (grid.w * grid.h)

    // set subMeshes
    tiledGround.subMeshes = []
  // tiledGround.subMeshes.push(new SubMesh(0, 0, verticesCount, 0 * tileIndicesLength, tileIndicesLength, tiledGround))
    // tiledGround.subMeshes.push(new SubMesh(1, 0, verticesCount, 1 * tileIndicesLength, tileIndicesLength, tiledGround))
    // tiledGround.subMeshes.push(new SubMesh(0, 0, verticesCount, 2 * tileIndicesLength, tileIndicesLength, tiledGround))
    let count = 0
    for (let row = 0; row < grid.h; row++) {
      for (let col = 0; col < grid.w; col++) {
        tiledGround.subMeshes.push(new SubMesh(row % 2 ^ col % 2, 0, verticesCount, count * tileIndicesLength, tileIndicesLength, tiledGround))
        count++
      }
    }

    return scene;
  }
}