import { ArcRotateCamera, BoxBlock, ComputeNormalsBlock, ConditionBlock, ConditionBlockTests, Engine, GeometryInputBlock, GeometryOutputBlock, HemisphericLight, InstantiateOnFacesBlock, MathBlock, MathBlockOperations, MeshBuilder, NodeGeometry, NodeGeometryBlockConnectionPointTypes, NodeGeometryContextualSources, RandomBlock, Scene, SetMaterialIDBlock, SetPositionsBlock, SphereBlock, Vector3, VectorConverterBlock } from "babylonjs";

export default class Test {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Test'
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

    // create source sphere
    const sphere = new SphereBlock('sphere')
    const seg = new GeometryInputBlock('seg', NodeGeometryBlockConnectionPointTypes.Int)
    seg.value = 10

    const size = new GeometryInputBlock('size', NodeGeometryBlockConnectionPointTypes.Float)
    size.value = 0.01
    const box = new BoxBlock('box')

    const normals = new GeometryInputBlock('normals')
    normals.contextualValue = NodeGeometryContextualSources.Normals
    const convert = new VectorConverterBlock('convert')
    const fy = new GeometryInputBlock('fy', NodeGeometryBlockConnectionPointTypes.Float)
    fy.value = 0.2
    const iTrue = new GeometryInputBlock('iTrue', NodeGeometryBlockConnectionPointTypes.Int)
    iTrue.value = 0
    const iFalse = new GeometryInputBlock('iFalse', NodeGeometryBlockConnectionPointTypes.Int)
    iFalse.value = 1
    const greater = new ConditionBlock('greater')
    greater.test = ConditionBlockTests.GreaterThan

    const setMatId = new SetMaterialIDBlock('setMatId')

    const instOnFaces = new InstantiateOnFacesBlock('instOnFaces')

    // create node geometry
    const nodeGeo = new NodeGeometry('nodeGeo')
    
    // create output
    const output = new GeometryOutputBlock('geometryout')
    nodeGeo.outputBlock = output
    
    // connections
    seg.output.connectTo(sphere.segments)
    size.output.connectTo(box.size)
    convert.yOut.connectTo(greater.left)
    fy.output.connectTo(greater.right)
    iTrue.output.connectTo(greater.ifTrue)
    iFalse.output.connectTo(greater.ifFalse)
    box.geometry.connectTo(setMatId.geometry)
    greater.output.connectTo(setMatId.id)
    sphere.geometry.connectTo(instOnFaces.geometry)
    setMatId.output.connectTo(instOnFaces.instance)
    instOnFaces.output.connectTo(output.geometry)

    // build and instantiate mesh
    nodeGeo.build()
    const mesh = nodeGeo.createMesh('nodegeomesh')

    return scene;
  }
}