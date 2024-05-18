import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class BlendModes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Blend Modes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.ambientColor = new Color3(0.05, 0.2, 0.05)

    const camera = new ArcRotateCamera('camera', Math.PI / 2, 1, 110, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(-60, 60, 80), scene);

    // plane
    const plane = MeshBuilder.CreatePlane('plane', {size: 250})
    plane.position.y = -8
    plane.rotation.x = Math.PI / 2

    // material
    const url = 'https://playground.babylonjs.com/textures/'
    const pMat = new StandardMaterial('pMat')
    pMat.diffuseTexture = new Texture(`${url}grass.jpg`)
    pMat.diffuseTexture.uScale = 5
    pMat.diffuseTexture.vScale = 5
    pMat.backFaceCulling = false

    plane.material = pMat

    const matBase = new StandardMaterial('matBase')
    matBase.diffuseTexture = new Texture(`${url}misc.jpg`)
    matBase.alpha = 0.9999
    matBase.ambientColor = Color3.White()

    const alphaModes = [
      Engine.ALPHA_COMBINE,
      Engine.ALPHA_ADD,
      Engine.ALPHA_SUBTRACT,
      Engine.ALPHA_MULTIPLY,
      Engine.ALPHA_MAXIMIZED
    ]

    // cubes
    const count = 5
    let mesh: Mesh
    let mat: StandardMaterial
    let angle
    for (let i = 0; i < count; i++) {
      mesh = MeshBuilder.CreateCylinder('cube' + i, {height: 12, diameter: 8, tessellation: 12, subdivisions: 1})
      mesh.position.x = -17 * (i + 0.5 - count / 2)
      mesh.rotation.y = 8
      mat = matBase.clone('cubeMat' + i)
      mat.alphaMode = alphaModes[i]
      mesh.material = mat
    }

    return scene;
  }
}