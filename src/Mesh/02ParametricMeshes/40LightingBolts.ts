import { ArcRotateCamera, Color3, Color4, CreateGreasedLine, Engine, GlowLayer, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { GreasedLineMesh } from "babylonjs/index";

export default class LightingBolts {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Lighting Bolts'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, -Math.PI / 2, 8, new Vector3(0, 0, 0), scene, true);
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = -Math.PI / 2
    camera.upperBetaLimit = Math.PI / 2

    scene.clearColor = new Color4(0, 0, 0, 1)

    const points: number[][] = []
    const colors: Color3[] = []
    const widths: number[] = []

    let mesh: GreasedLineMesh

    const glow = new GlowLayer('glow', scene, {
      blurKernelSize: 32
    })
    glow.intensity = 6

    function drawLighting() {
      if (mesh) {
        mesh.dispose()
      }

      const startX = 0
      const startY = 0
      const sz = 0
      let ci = 0
      let si = 0
      const sc = Math.random() * 100
      const ssc = Math.random() * 100
      const splits = Math.random() * 30
      const subSprits = Math.random() * 30
      const startWidth = Math.random() * 3 + 4
      const startLength = Math.random() * 40 + 70

      points.length = 0
      colors.length = 0
      widths.length = 0

      getLightingLines(startX, startY, startWidth, startLength)

      mesh = CreateGreasedLine('lighting', {
        points,
        widths
      }, {
        width: 0.6,
        useColors: true,
        colors
      })
      glow.referenceMeshToUseItsOwnMaterial(mesh)
      camera.zoomOn([mesh])

      function getLightingLines(sx: number, sy: number, width: number, len: number) {
        const cx = sx + (Math.random() * len) - len / 2
        const cy = sy + (Math.random() * len / 2)

        const color1 = Color3.FromHSV(40, 0.5, 0.5)
        colors.push(color1)
        colors.push(color1)

        widths.push(width, width, width, width)
        points.push([sx, sy, sz, cx, cy, sz])

        si = 0
        Math.random() * 100 < sc ? split(cx, cy, width * 0.9, len * 0.95) : 0
        if (ci < splits) {
          ci += 1
          getLightingLines(cx, cy, width * 0.9, len * 0.95)
        }
      }

      function split(sx: number, sy: number, width: number, len: number) {
        const cx = sx + (Math.random() * len) - len / 2
        const cy = sy + (Math.random() * len / 2)

        const color1 = Color3.FromHSV(40, 0.5, 0.5)
        colors.push(color1)
        colors.push(color1)

        widths.push(width, width, width, width)
        points.push([sx, sy, sz, cx, cy, sz])

        if (si < subSprits) {
          si += 1
          split(cx, cy, width * 0.9, len * 0.95)
          Math.random() * 100 < ssc ? split(cx, cy, width * 0.9, len * 0.95) : 0
        }
      }
    }

    drawLighting()
    setInterval(() => {
      drawLighting()
    }, 1000)

    return scene;
  }
}