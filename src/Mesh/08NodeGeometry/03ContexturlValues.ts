import { ArcRotateCamera, ComputeNormalsBlock, Engine, GeometryInputBlock, GeometryOutputBlock, HemisphericLight, MathBlock, MathBlockOperations, NodeGeometry, NodeGeometryBlockConnectionPointTypes, NodeGeometryContextualSources, RandomBlock, Scene, SetPositionsBlock, SphereBlock, Vector3, VectorConverterBlock } from "babylonjs";

export default class ContexturlValues {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Contexturl Values'
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

    const min = new GeometryInputBlock('min', NodeGeometryBlockConnectionPointTypes.Float)
    min.value = 0
    const max = new GeometryInputBlock('max', NodeGeometryBlockConnectionPointTypes.Float)
    max.value = 1

    const normals = new GeometryInputBlock('normals')
    normals.contextualValue = NodeGeometryContextualSources.Normals
    const positions = new GeometryInputBlock('positions')
    positions.contextualValue = NodeGeometryContextualSources.Positions

    const random = new RandomBlock('random')
    const convert = new VectorConverterBlock('convert')
    
    const multiply = new MathBlock('multiply')
    multiply.operation = MathBlockOperations.Multiply
    const add = new MathBlock('add')
    add.operation = MathBlockOperations.Add
    const setPos = new SetPositionsBlock('setPos')
    const computeNorm = new ComputeNormalsBlock('computeNorm')

    // create output
    const output = new GeometryOutputBlock('output')

    // connections
    sphere.geometry.connectTo(setPos.geometry)
    min.output.connectTo(random.min)
    max.output.connectTo(random.max)
    random.output.connectTo(convert.xIn)
    random.output.connectTo(convert.yIn)
    random.output.connectTo(convert.zIn)
    normals.output.connectTo(multiply.left)
    convert.xyzOut.connectTo(multiply.right)
    positions.output.connectTo(add.left)
    multiply.output.connectTo(add.right)
    add.output.connectTo(setPos.positions)
    // setPos.output.connectTo(output.geometry)
    setPos.output.connectTo(computeNorm.geometry)
    computeNorm.output.connectTo(output.geometry)

     // create node geometry
    const nodeGeo = new NodeGeometry('nodeGeo')

   // set output, build and instantiate mesh
    nodeGeo.outputBlock = output
    nodeGeo.build()
    const mesh = nodeGeo.createMesh('mesh')

    return scene;
  }
}