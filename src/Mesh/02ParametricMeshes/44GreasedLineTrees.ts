import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, Scene, Vector3 } from "babylonjs";

export default class GreasedLineTrees {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Trees'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, 0, 50, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const points: number[][] = []
    const widths: number[] = []
    const colors: Color3[] = []

    drawTree(0, 0, 4, -Math.PI / 2,10 , 9)

    const tree = CreateGreasedLine('tree', {
      points,
      widths
    }, {
      useColors: true,
      colors
    })

    camera.focusOn([tree])

    function drawTree(startX: number, startY: number, length: number, angle: number, depth: number, branchWidth: number) {
      const rand = Math.random
      let newLength, newAngle, newDepth, maxBranch = 3, endX, endY, maxAngle = 2 * Math.PI / 6, subBranches

      endX = startX + length * Math.cos(angle)
      endY = startY + length * Math.sin(angle)

      points.push([startX, 0, startY, endX, 0, endY])
      widths.push(branchWidth, branchWidth, branchWidth, branchWidth)

      if (depth <= 2) {
        const c = new Color3(0, (((rand() * 64) + 128) >> 0) / 255, 0)
        colors.push(c, c)
      } else {
        const c = new Color3(0, (((rand() * 64) + 64) >> 0) / 255, 0)
        colors.push(c, c)
      }

      newDepth = depth - 1
      if (!newDepth) return
      subBranches = (rand() * (maxBranch - 1)) + 1
      branchWidth *= 0.7
      for (let i = 0; i < subBranches; i++) {
        newAngle = angle + rand() * maxAngle - maxAngle * 0.5
        newLength = length * (0.7 + rand() * 0.3)

        drawTree(endX, endY, newLength, newAngle, newDepth, branchWidth)
      }
    }

    return scene;
  }
}