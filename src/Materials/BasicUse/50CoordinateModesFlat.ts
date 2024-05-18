import { ArcRotateCamera, Color3, CubeTexture, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, UniversalCamera, Vector3 } from "babylonjs";

export default class CoordinateModesFlat {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Coordinate Modes Flat'
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

    this.createShape(-1, 2, 'PLANAR', Texture.PLANAR_MODE)
    this.createShape(1, 2, 'EQUIRECTANGULAR', Texture.EQUIRECTANGULAR_MODE)
    this.createShape(-2, 0, 'Diffuse', null)
    this.createShape(0, 0, 'FIXED_EQUI', Texture.FIXED_EQUIRECTANGULAR_MODE)
    this.createShape(2, 0, 'FIXED_EQUI_MIRR', Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE)
    this.createShape(-1, -2, 'PROJECTION', Texture.PROJECTION_MODE)
    this.createShape(1, -2, 'SPHERICAL', Texture.SPHERICAL_MODE)

    return scene;
  }

  private createTexture(): Texture {
    return new Texture(
      '/Materials/letter_grid.png',
    )
  }

  private createMaterial(name: string, mode: number | null): StandardMaterial {
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

  private createShape(x: number, y: number, name: string, mode: number | null) {
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