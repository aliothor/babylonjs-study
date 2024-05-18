import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorDistribution, HemisphericLight, Scene, Vector3 } from "babylonjs";

export default class GreasedLineLineColors {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'GreasedLine Line Colors'
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

    const points1 = []
    const colors = [Color3.Red(), Color3.Green(), Color3.Blue(), Color3.Yellow()]
    for (let x = 0; x < 10; x += 0.25) {
      points1.push(new Vector3(x, Math.cos(x / 2) - 2, 0))
    }
    const line1 = CreateGreasedLine('line1', {points: points1}, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_START
    })

    const line2 = CreateGreasedLine('line2', {
      points: points1.map(p => new Vector3(p.x, p.y - 2, p.z)),
    }, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_END
    })

    const line3 = CreateGreasedLine('line3', {
      points: points1.map(p => new Vector3(p.x, p.y - 4, p.z)),
    }, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_EVEN
    })

    const line4 = CreateGreasedLine('line4', {
      points: points1.map(p => new Vector3(p.x, p.y - 6, p.z)),
    }, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_START_END
    })

    const line5 = CreateGreasedLine('line5', {
      points: points1.map(p => new Vector3(p.x, p.y - 8, p.z)),
    }, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_REPEAT
    })

    const line6 = CreateGreasedLine('line6', {
      points: points1.map(p => new Vector3(p.x, p.y - 10, p.z)),
    }, {
      width: 0.4,
      colors,
      useColors: true,
      colorDistribution: GreasedLineMeshColorDistribution.COLOR_DISTRIBUTION_NONE
    })


    camera.zoomOnFactor = 1.3
    camera.zoomOn([line1, line2, line3, line4, line5, line6])

    return scene;
  }
}