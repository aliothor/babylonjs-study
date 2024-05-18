import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class FitTextToPlane {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fit Text to Plane'
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

    // plane
    const planeWidth = 10
    const planeHeight = 3
    const plane = MeshBuilder.CreatePlane('plane', {width: planeWidth, height: planeHeight})

    const text = '中文 Some Words to Fit Plane 文字'
    const fontype = 'luke快写'
    const DTWidth = planeWidth * 60
    const DTHeight = planeHeight * 60
    const dynTex = new DynamicTexture('dynTex', {width: DTWidth, height: DTHeight})

    // check width
    const ctx = dynTex.getContext()
    const size = 12 // any value
    ctx.font = size + 'px ' + fontype
    const textWidth = ctx.measureText(text).width
    const ratio = textWidth / size

    const fontSize = Math.floor(DTWidth / ratio)
    const font = fontSize + 'px ' + fontype

    dynTex.drawText(text, null, null, font, '#000000', '#ffffff', true)

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = dynTex
    plane.material = mat

    return scene;
  }
}