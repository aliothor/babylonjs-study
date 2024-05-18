import { ArcRotateCamera, CreateGreasedLine, Engine, GreasedLineMeshColorMode, HemisphericLight, Scene, Vector3, VertexBuffer } from "babylonjs";

export default class VertexColors {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Vertex Colors'
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

    const points = [
      -3, 0, 0,
      3, 0, 0
    ]
    const line = CreateGreasedLine('line', {points}, {
      width: 2,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })

    // add colors
    let colors = line.getVerticesData(VertexBuffer.ColorKind)
    if (!colors) {
      colors = []
      const positions = line.getVerticesData(VertexBuffer.PositionKind)
      if (positions) {
        for (let p = 0; p < positions.length / 3; p++) {
          colors.push(Math.random(), Math.random(), Math.random(), 1)
        }
      }
    }
    line.setVerticesData(VertexBuffer.ColorKind, colors)


    return scene;
  }
}