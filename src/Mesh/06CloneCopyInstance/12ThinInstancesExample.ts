import { ArcRotateCamera, Color3, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class ThinInstancesExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Thin Instances Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 5, Math.PI / 3, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');

    const numPerSide = 40, size = 100, ofst = size / (numPerSide - 1)
    const m = Matrix.Identity()
    let col = 0, index = 0;
    let instanceCount = numPerSide * numPerSide * numPerSide
    let matricesData = new Float32Array(16 * instanceCount)
    let colorData = new Float32Array(4 * instanceCount)

    for (let x = 0; x < numPerSide; x++) {
      for (let y = 0; y < numPerSide; y++) {
        for (let z = 0; z < numPerSide; z++) {
          m.copyToArray(matricesData, index * 16)

          matricesData[index * 16 + 12] = -size / 2 + ofst * x
          matricesData[index * 16 + 13] = -size / 2 + ofst * y
          matricesData[index * 16 + 14] = -size / 2 + ofst * z

          const coli = Math.floor(col)
          colorData[index * 4 + 0] = ((coli & 0xff0000) >> 16) / 255
          colorData[index * 4 + 1] = ((coli & 0x00ff00) >> 8) / 255
          colorData[index * 4 + 2] = ((coli & 0x0000ff) >> 0) / 255
          colorData[index * 4 + 3] = 1

          index++
          col += 0xffffff / instanceCount
        }
      }
    }

    box.thinInstanceSetBuffer('matrix', matricesData, 16)
    box.thinInstanceSetBuffer('color', colorData, 4)

    const mat = new StandardMaterial('mat')
    mat.disableLighting = true
    mat.emissiveColor = Color3.White()
    box.material = mat

    // scene.debugLayer.show({showExplorer: false})

    return scene;
  }
}