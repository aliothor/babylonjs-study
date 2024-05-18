import { ArcRotateCamera, CreateGreasedLine, Engine, GreasedLineMeshColorMode, GreasedLineTools, HemisphericLight, MeshBuilder, Scene, Vector3, VertexBuffer } from "babylonjs";

export default class ModifyingPointsPositions {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Modifying Points Positions'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 4})
    sphere.setEnabled(false)

    const points = GreasedLineTools.MeshesToLines([sphere])
    const lines = CreateGreasedLine('lines', {
      points,
      updatable: true
    }, {
      width: 0.1,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })

    const positions = lines.getVerticesData(VertexBuffer.PositionKind)
    if (positions) {
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] *= 1.5
        positions[i * 3 + 1] *= 3
        positions[i * 3 + 2] *= 2.5
      }
      lines.updateVerticesData(VertexBuffer.PositionKind, positions)
    }

    return scene;
  }
}