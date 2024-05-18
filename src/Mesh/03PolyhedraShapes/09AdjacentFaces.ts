import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class AdjacentFaces {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Adjacent Faces'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const goldberg = MeshBuilder.CreateGoldberg('g', { m: 5, n: 2 });

    let colors = []
    let face = 0
    colors.push([face, face, new Color4(1, 0, 0, 1)])
    for (let f = 0; f < goldberg.goldbergData.adjacentFaces[face].length; f++) {
      colors.push([goldberg.goldbergData.adjacentFaces[face][f], goldberg.goldbergData.adjacentFaces[face][f], new Color4(0, 0, 1, 1)])
    }

    face = 85
    colors.push([face, face, new Color4(1, 0, 1, 1)])
    for (let f = 0; f < goldberg.goldbergData.adjacentFaces[face].length; f++) {
      colors.push([goldberg.goldbergData.adjacentFaces[face][f], goldberg.goldbergData.adjacentFaces[face][f], new Color4(0, 1, 0, 1)])
    }

    goldberg.setGoldbergFaceColors(colors)

    return scene;
  }
}