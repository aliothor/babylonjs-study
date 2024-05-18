import { ArcRotateCamera, Color3, Curve3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class ArcSegmentCircle {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Arc Segment Circle'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 50, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const rand = Math.random
    const f = new Vector3(-0.5 + rand(), -0.5 + rand(), -0.5 + rand()).scale(20)
    const s = new Vector3(-0.5 + rand(), -0.5 + rand(), -0.5 + rand()).scale(20)
    const t = new Vector3(-0.5 + rand(), -0.5 + rand(), -0.5 + rand()).scale(20)

    // arc
    // const arc = Curve3.ArcThru3Points(f, s, t)
    // closed
    // const arc = Curve3.ArcThru3Points(f, s, t, 32, true)
    // full
    const arc = Curve3.ArcThru3Points(f, s, t, 32, undefined, true)

    const arcLine = MeshBuilder.CreateLines('arcLine', {points: arc.getPoints()})

    const sphereF = MeshBuilder.CreateSphere('sphereF')
    const sphereS = MeshBuilder.CreateSphere('sphereS')
    const sphereT = MeshBuilder.CreateSphere('sphereT')
    sphereF.position = f
    sphereS.position = s
    sphereT.position = t
    sphereF.material = new StandardMaterial('fMat')
    sphereF.material.diffuseColor = Color3.Red()
    sphereS.material = new StandardMaterial('sMat')
    sphereS.material.diffuseColor = Color3.Green()
    sphereT.material = new StandardMaterial('tMat')
    sphereT.material.diffuseColor = Color3.Blue()

    return scene;
  }
}