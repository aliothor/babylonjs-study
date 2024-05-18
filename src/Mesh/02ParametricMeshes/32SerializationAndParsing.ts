import { ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMesh, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class SerializationAndParsing {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Serialization And Parsing'
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

    const points = [
      -1, 8, 0,
      0, 8, 0,
      1, 7, 0
    ]
    const line = CreateGreasedLine('line', {points}, {color: Color3.Red()})

    let serialized = {}
    line.serialize(serialized)
    console.log(serialized);

    const serializeMat = line.material?.serialize()
    console.log(serializeMat);
    
    line.material?.dispose()
    line.dispose()

    // rebuild
    const lineParsed = GreasedLineMesh.Parse(serialized, scene)
    const matParsed = StandardMaterial.Parse(serializeMat, scene, '')

    lineParsed.material = matParsed
    

    camera.zoomOn([lineParsed])

    return scene;
  }
}