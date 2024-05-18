import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ClosedShapes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Closed Shapes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 45, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)
    light.specular = new Color3(1, 1, 1)
    light.groundColor = new Color3(0, 0, 0)
    const pl = new PointLight('pl', new Vector3(0, 0, 0))
    pl.diffuse = new Color3(1, 1, 1)
    pl.intensity = 0.5

    const paths = []
    const disp = 10
    const radius = 4
    const steps = 60
    const step = 2 * Math.PI / steps
    const circle = []

    for (let i = 0; i < 3 * Math.PI / 2; i += step) {
      const x = radius * Math.cos(i) + disp
      const y = radius * Math.sin(i)
      const z = 0
      circle.push(new Vector3(x, y, z))
    }
    const c = MeshBuilder.CreateLines('c', {points: circle})
    c.color = Color3.Red()

    const deltaSteps = 40
    const delta = 2 * Math.PI / deltaSteps
    for (let p = 0; p < 7 * Math.PI / 4; p += delta) {
      const path = []
      for (let i = 0; i < circle.length; i++) {
        const x = circle[i].x * Math.cos(p) + circle[i].z * Math.sin(p)
        const y = circle[i].y
        const z = -circle[i].x * Math.sin(p) + circle[i].z * Math.cos(p)
        path.push(new Vector3(x, y, z))
      }
      paths.push(path)
    }

    const ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: paths,
      // closeArray: true,
      // closePath: true
    })
    // material
    const mat = new StandardMaterial('mat')
    mat.diffuseColor = new Color3(0.5, 0.5, 1)
    mat.emissiveColor = Color3.Black()
    mat.backFaceCulling = false
    ribbon.material = mat

    const tex = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    tex.uScale = 5
    tex.vScale = 5
    mat.diffuseTexture = tex

    return scene;
  }
}