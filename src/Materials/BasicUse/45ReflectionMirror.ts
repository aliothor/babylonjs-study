import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, MirrorTexture, Plane, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class ReflectionMirror {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Reflection Mirror'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere')
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = new Color3(1, 0, 0)
    sphere.material = sMat

    // create glass planes
    for (let i = 0; i < 4; i++) {
      // const mat = new StandardMaterial('mat')
      // mat.diffuseTexture = new Texture('/Materials/poker.jpeg')
      // const f = new Vector4(0.5, 0, 1, 1)
      // const b = new Vector4(0, 0, 0.5, 1)
      // const glass = MeshBuilder.CreatePlane('glass' + i, {width: 5, height: 5, sideOrientation: Mesh.DOUBLESIDE, frontUVs: f, backUVs: b})
      // glass.material = mat

      const glass = MeshBuilder.CreatePlane('glass' + i, {width: 5, height: 5})

      glass.position = new Vector3(((2 - i) % 2) * 6, 0, ((1 - i) % 2) * 6)
      glass.rotation = new Vector3(0, i * Math.PI / 2, 0)

      glass.computeWorldMatrix(true)
      // create reflecting surface
      const reflector = Plane.FromPositionAndNormal(glass.position, glass.getFacetNormal(0).scale(-1))

      // create mirror material
      const mat = new StandardMaterial('mat' + i)
      const mt = new MirrorTexture('mirror' + i, 1024, scene, true)
      mt.mirrorPlane = reflector
      mt.renderList = [sphere]
      mt.level = 1
      mat.reflectionTexture = mt

      glass.material = mat
    }

    return scene;
  }
}