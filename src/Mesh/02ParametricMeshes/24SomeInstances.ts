import { ArcRotateCamera, Color3, CreateGreasedLine, Curve3, Engine, GlowLayer, GreasedLineMeshColorMode, GreasedLineMeshMaterialType, GreasedLineTools, HemisphericLight, MeshBuilder, PBRMaterial, Scene, SceneLoader, Texture, Vector3 } from "babylonjs";

export default class SomeInstances {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Some Instances'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const points1 = [-1, 0, 0, 1, 0, 0]
    const line1 = CreateGreasedLine('line1', {points: points1})
    line1.position.x = 2
    line1.rotation.z = Math.PI / 2
    line1.scaling = new Vector3(2, 2, 2)  // 只有 x 有效

    // arc
    const f = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const s = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const t = new Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).scale(20)
    const arc = Curve3.ArcThru3Points(f, s, t)
    const arcLine = CreateGreasedLine('arc', {points: arc.getPoints()})

    // texture
    const points3 = [-6, 0, 0, 6, 0, 0]
    const line3 = CreateGreasedLine('line3', {points: points3}, {
      width: 1,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })
    const tex = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    tex.uScale = 10
    line3.material.emissiveTexture = tex

    // color
    const points4 = [-6, 2, 0, 6, 2, 0]
    const line4 = CreateGreasedLine('line4', {points: points4}, {width: 1})
    line4.greasedLineMaterial.color = null
    line4.material.emissiveColor = Color3.Red()

    // glow
    const points5 = [-6, 4, 0, 6, 4, 0]
    const line5 = CreateGreasedLine('line5', {points: points5}, {width: 1})
    line5.greasedLineMaterial.color = null
    line5.material.emissiveColor = Color3.Yellow()

    const gl = new GlowLayer('glow', scene, {blurKernelSize: 32})
    gl.intensity = 1.8
    gl.referenceMeshToUseItsOwnMaterial(line5)

    // text
    fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json').then(data => {
      data.json().then((fontData) => {
        const points6 = GreasedLineTools.GetPointsFromText(
          'BabylonJS',
          2,
          16,
          fontData
        )
        const lint6 = CreateGreasedLine('line6', {points: points6})
      })
    })



    camera.zoomOn([line1, arcLine, ])

    return scene;
  }
}