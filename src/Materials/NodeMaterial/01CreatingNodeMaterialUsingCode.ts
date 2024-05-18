import { ArcRotateCamera, Color4, Engine, FragmentOutputBlock, InputBlock, MeshBuilder, NodeMaterial, NodeMaterialSystemValues, Scene, TransformBlock, Vector3, VertexOutputBlock } from "babylonjs";

export default class CreatingNodeMaterialUsingCode {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Creating a Node Material Using Code'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const box = MeshBuilder.CreateBox('box');

    const nodeMat = new NodeMaterial('nodeMat', scene, {
      emitComments: true
    })
    // nodeMat.setToDefault()

    // vertex
    const position = new InputBlock('position')
    position.setAsAttribute('position')

    // 1 --->
    // const world = new InputBlock('world')
    // world.setAsSystemValue(NodeMaterialSystemValues.World)

    // const worldPos = new TransformBlock('worldPos')
    // position.connectTo(worldPos)
    // world.connectTo(worldPos)

    // const viewProjection = new InputBlock('viewProjection')
    // viewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection)

    // const worldPosMultViewProjection = new TransformBlock('worldPos*ViewProjection')
    // worldPos.connectTo(worldPosMultViewProjection)
    // viewProjection.connectTo(worldPosMultViewProjection)
    // 1 <---

    // 2 --->
    const worldViewPos = new InputBlock('worldViewPos')
    worldViewPos.setAsSystemValue(NodeMaterialSystemValues.WorldViewProjection)

    const worldViewProjection = new TransformBlock('worldViewProjection')
    position.connectTo(worldViewProjection)
    worldViewPos.connectTo(worldViewProjection)
    // 2 <---

    const vertextOutput = new VertexOutputBlock('vertexOutput')
    // worldPosMultViewProjection.connectTo(vertextOutput)    // 1
    worldViewProjection.connectTo(vertextOutput)              // 2

    // fragment
    const color = new InputBlock('color')
    color.value = new Color4(0.8, 0.8, 0.8, 1)

    const fragmentOutput = new FragmentOutputBlock('fragmentOutput')
    color.connectTo(fragmentOutput)

    // add to nodemat
    nodeMat.addOutputNode(vertextOutput)
    nodeMat.addOutputNode(fragmentOutput)

    try {
      nodeMat.build(true)
    } catch (err) {
      console.error(err);
    }

    box.material = nodeMat

    return scene;
  }
}