import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3, VertexBuffer } from "babylonjs";

export default class PlayingWithVertices {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Playing With Vertices'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere', {updatable: true})

    // position
    const positions = sphere.getVerticesData(VertexBuffer.PositionKind)!
    const numberOfVertices = positions.length / 3
    for (let p = 0; p < numberOfVertices; p++) {
      positions[p * 3] *= 1.5
      positions[p * 3 + 1] *= 3
      positions[p * 3 + 2] *= 2.5
    }
    sphere.updateVerticesData(VertexBuffer.PositionKind, positions)

    // color
    let colors = sphere.getVerticesData(VertexBuffer.ColorKind)
    if (!colors) {
      colors = []
      for (let p = 0; p < numberOfVertices; p++) {
        colors.push(Math.random(), Math.random(), Math.random(), 1)
      }
      sphere.setVerticesData(VertexBuffer.ColorKind, colors)
    }

    return scene;
  }
}