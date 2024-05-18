import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer } from "babylonjs";

export default class CustomBuffersExample1 {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Buffers Example 1'
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

    const box = MeshBuilder.CreateBox('box');
    box.alwaysSelectAsActiveMesh = true

    const nInstances = 1000
    let colorData = new Float32Array(4 * 1000)
    for (let i = 0; i < nInstances; i++) {
      colorData[i * 4] = Math.random()
      colorData[i * 4 + 1] = Math.random()
      colorData[i * 4 + 2] = Math.random()
      colorData[i * 4 + 3] = 1
    }

    const buffer = new VertexBuffer(this.engine, colorData, VertexBuffer.ColorKind, false, false, 4, true)
    box.setVerticesBuffer(buffer)

    const mat = new StandardMaterial('mat')
    mat.disableLighting = true
    mat.emissiveColor = Color3.White()
    box.material = mat

    for (let i = 0; i < nInstances - 1; i++) {
      const inst = box.createInstance('box' + i)
      inst.alwaysSelectAsActiveMesh = true
      inst.position.x = 20 - Math.random() * 40
      inst.position.y = 20 - Math.random() * 40
      inst.position.z = 20 - Math.random() * 40
    }
    camera.radius = 60

    return scene;
  }
}