import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, MultiMaterial, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class MultiMaterialWithMergedMeshes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Multi-Material With Merged Meshes'
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

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})

    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(1, 0, 0)

    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseColor = new Color3(0, 1, 0)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    sphere.position.y = 1

    const cube = MeshBuilder.CreateBox('cube', {size: 1, height: 3});
    cube.position = new Vector3(1, 1.5, 0)

    // sphere.material = mat1
    // cube.material = mat2
    // const mesh = Mesh.MergeMeshes([sphere, cube], true, true, undefined, false, true)

    const multiMat = new MultiMaterial('multiMat')
    multiMat.subMaterials.push(mat1)
    multiMat.subMaterials.push(mat2)
    const mesh = Mesh.MergeMeshes([sphere, cube], true, true, undefined, true)
    mesh!.material = multiMat
    mesh!.subMeshes[1].materialIndex = 1

    return scene;
  }
}