import { ArcRotateCamera, Axis, Color3, Color4, CreateGreasedLine, Curve3, Engine, GreasedLineMeshColorMode, GreasedLineTools, HemisphericLight, MeshBuilder, Scene, Texture, Vector3 } from "babylonjs";

export default class NavigationPathDisplayingCurrents {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Navigation Path or Displaying Currents'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 60, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)
    light.specular = new Color3(1, 1, 1)
    light.groundColor = new Color3(0.5, 0.5, 0.5)
    light.intensity = 6

    scene.clearColor = Color4.FromHexString('#020207')

    const radius = 100

    const { points, length } = createPath(radius)

    const navPathLine = drawLine('nav-path', 2, points)
    const tex = new Texture('https://playgrounds.babylonjs.xyz/arrow.png')
    tex.hasAlpha = true
    navPathLine.material.diffuseTexture = tex
    tex.uScale = length / 2

    camera.zoomOnFactor = 0.8
    camera.zoomOn([navPathLine])

    scene.onBeforeRenderObservable.add(() => {
      const animRatio = scene.getAnimationRatio()
      tex.uOffset -= 0.04 * animRatio

      navPathLine.rotate(Axis.X, 0.001 * animRatio)
    })

    function createPath(radius: number) {
      const r = () => Math.max(0.2, Math.random())

      const pos = new Vector3(0, radius * r(), Math.cos(1) * radius * r())
      const basePoints = new Array(30).fill(0).map((_, index) => {
        const angle = (index / 20) * Math.PI * 2
        return pos.add(new Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r() - radius / 2, Math.cos(angle) * radius * r() - radius / 4)).clone()
      })

      const points = Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
      const length = GreasedLineTools.GetLineLength(points)
      return {
        points,
        length
      }
    }

    function drawLine(name: string, width: number, points: Vector3[]) {
      const colors: Color3[] = []
      const color1 = Color3.Red()
      const color2 = Color3.Green()
      for (let i = 0; i < 100; i++) {
        colors.push(color1)
      }
      for (let i = 0; i < 100; i++) {
        colors.push(color2)
      }

      const line = CreateGreasedLine(name, {
        points,
        updatable: true
      }, {
        colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
        width,
        useColors: true,
        colors
      })

      return line
    }

    return scene;
  }
}