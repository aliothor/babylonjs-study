import { AbstractAssetTask, ArcRotateCamera, AssetsManager, BoxBlock, Engine, GeometryInputBlock, HemisphericLight, InstantiateOnVerticesBlock, MeshBuilder, NodeGeometry, NodeGeometryBlockConnectionPointTypes, Scene, SetColorsBlock, Vector3, Vector4 } from "babylonjs";
// import * as BABYLON from 'babylonjs';

export default class LoadingUpdatingFromFile {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Loading and Updating From File'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 2, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const assetsManager = new AssetsManager()
    // const nodeGeometryFile = assetsManager.addTextFileTask('load node geometry', '/Meshes/nodeGeometry.json')

    // assetsManager.load()
    // assetsManager.onFinish = (tasks: AbstractAssetTask[]) => {
    //   const nodeGeometryJSON = JSON.parse(nodeGeometryFile.text)
    //   // parse
    //   const nodeGeo = NodeGeometry.Parse(nodeGeometryJSON)

    //   // modify
    //   const box = nodeGeo.getBlockByName('Box') as BoxBlock
    //   const inst = nodeGeo.getBlockByName('InstantiateVertices') as InstantiateOnVerticesBlock

    //   const setColor = new SetColorsBlock('setColor')
    //   const color = new GeometryInputBlock('color', NodeGeometryBlockConnectionPointTypes.Vector4)
    //   color.value = new Vector4(1, 1, 0, 1)
      
    //   box.geometry.connectTo(setColor.geometry)
    //   color.output.connectTo(setColor.colors)
    //   setColor.output.connectTo(inst.instance)

    //   nodeGeo.build()
    //   let mesh = nodeGeo.createMesh('mesh')

    //   setTimeout(() => {
    //     mesh?.dispose()
    //     const size = nodeGeo.getBlockByName('Size')
    //     if (size) (size as GeometryInputBlock).value = 0.07
    //     nodeGeo.build()
    //     mesh = nodeGeo.createMesh('mesh')
    //   }, 2000);
    // }

    setTimeout(async () => {
      const nodeGeo = await NodeGeometry.ParseFromSnippetAsync('4DZHCN#9')
      nodeGeo.build()
      const mesh = nodeGeo.createMesh('mesh')
    });

    return scene;
  }
}