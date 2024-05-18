import { ArcRotateCamera, Engine, GeometryOutputBlock, HemisphericLight, MeshBuilder, NodeGeometry, Scene, SphereBlock, Vector3 } from "babylonjs";

export default class BasicNodeGeometry {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Node Geometry Basic'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // create source sphere
    const sphere = new SphereBlock('sphere')

    // create output
    const output = new GeometryOutputBlock('output')

    // connections
    sphere.geometry.connectTo(output.geometry)

     // create node geometry
    const nodeGeo = new NodeGeometry('nodeGeo')

   // set output, build and instantiate mesh
    nodeGeo.outputBlock = output
    nodeGeo.build()
    const mesh = nodeGeo.createMesh('mesh')

    return scene;
  }
}