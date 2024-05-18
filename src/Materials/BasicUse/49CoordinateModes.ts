import { ArcRotateCamera, Color3, CubeTexture, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, UniversalCamera, Vector3 } from "babylonjs";

export default class CoordinateModes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Coordinate Modes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new UniversalCamera('camera', new Vector3(0, 0, -10))
    camera.attachControl(this.canvas, true);
    camera.setTarget(Vector3.Zero())
    camera.speed = 0.25

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    this.createShape(-2, 1, 'PLANAR', Texture.PLANAR_MODE)
    this.createShape(0, 1, 'CUBIC', Texture.CUBIC_MODE)
    this.createShape(2, 1, 'INVCUBIC', Texture.INVCUBIC_MODE)
    this.createShape(-1, -1, 'SKYBOX', Texture.SKYBOX_MODE)
    this.createShape(1, -1, 'PROJECTION', Texture.PROJECTION_MODE)

    return scene;
  }

  private createTexture(): CubeTexture {
    return new CubeTexture(
      '/Materials/',
      null,
      // +x, +y, +z, -x, -y, -z
      ['right.png', 'up.png', 'front.png', 'left.png', 'down.png', 'back.png']
    )
  }

  private createMaterial(name: string, mode: number): StandardMaterial {
    const mat = new StandardMaterial('mat_' + name)
    mat.backFaceCulling = false
    mat.specularColor = Color3.BlackReadOnly
    if (mode == null) {
      mat.diffuseTexture = this.createTexture()
      mat.diffuseTexture.name = 'tex_' + name
    } else {
      mat.diffuseColor = Color3.BlackReadOnly
      mat.reflectionTexture = this.createTexture()
      mat.reflectionTexture.name = 'tex_' + name
      mat.reflectionTexture.coordinatesMode = mode
    }
    return mat
  }

  private createShape(x: number, y: number, name: string, mode: number) {
    const shape = MeshBuilder.CreateBox(name)
    shape.position.x = x
    shape.position.y = y
    shape.material = this.createMaterial(name, mode)

    const sign = MeshBuilder.CreatePlane('sign_' + name, {width: 1.75, height: 0.25})
    sign.position.x = x
    sign.position.y = y - 0.75
    const mat = new StandardMaterial('signMat_' + name)
    mat.backFaceCulling = false
    mat.specularColor = Color3.BlackReadOnly
    const dynTex = new DynamicTexture('dynTex_' + name, {width: 350, height: 50})
    dynTex.drawText(name, null, null, 'Bold 32px Arial', '#fff000', '#808080', true)
    mat.diffuseTexture = dynTex
    sign.material = mat
  }

}