import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, MultiMaterial, Scene, StandardMaterial, SubMesh, Texture, Vector3 } from "babylonjs";

export default class SphereWithMultiMaterial {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sphere With Multi Material'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat0 = new StandardMaterial('mat0')
    mat0.diffuseColor = new Color3(1, 0, 0)
    mat0.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/normalMap.jpg')

    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(0, 0, 1)

    const mat2 = new StandardMaterial('mat2')
    mat2.emissiveColor = new Color3(0.4, 0, 0.4)

    const multiMat = new MultiMaterial('multiMat')
    multiMat.subMaterials.push(mat0)
    multiMat.subMaterials.push(mat1)
    multiMat.subMaterials.push(mat2)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    sphere.material = multiMat

    const verticesCount = sphere.getTotalVertices()
    console.log("🚀 ~ file: 28SphereWithMultiMaterial.ts:43 ~ SphereWithMultiMaterial ~ CreateScene ~ verticesCount:", verticesCount, sphere.getTotalIndices())

    new SubMesh(0, 0, verticesCount, 0, 900, sphere)
    new SubMesh(1, 0, verticesCount, 900, 900, sphere)
    new SubMesh(2, 0, verticesCount, 1800, 2088, sphere)

    scene.registerBeforeRender(function() {
      sphere.rotation.y += 0.01
    })

    return scene;
  }
}