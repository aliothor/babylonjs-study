import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class FitPlaneToText {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fit Plane to Text'
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

    const light = new HemisphericLight('light', new Vector3(0, 0, -1), scene);
    light.intensity = 0.7

    const fontSize = 48
    const font = 'bold ' + fontSize + 'px luke快写'

    // plane
    const planeHeight = 3

    // dynamic texture
    const DTHeight = 1.5 * fontSize
    const ratio = planeHeight / DTHeight

    const text = 'Some Words'

    // caculate
    const temp = new DynamicTexture('temp', 64)
    const tmpCtx = temp.getContext()
    tmpCtx.font = font
    const DTWidth = tmpCtx.measureText(text).width + 8
    const planeWidth = DTWidth * ratio

    // new dynamic texture
    const dynTex = new DynamicTexture('dynTex', {width: DTWidth, height: DTHeight})
    dynTex.drawText(text, null, null, font, '#000', '#fff', true)
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = dynTex

    const plane = MeshBuilder.CreatePlane('plane', {width: planeWidth, height: planeHeight})
    plane.material = mat

    return scene;
  }
}