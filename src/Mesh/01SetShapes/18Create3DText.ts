import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class Create3DText {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create 3D Text'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 180, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const url = 'https://assets.babylonjs.com/fonts/Droid Sans_Regular.json'
    fetch(url).then((value) => {
      value.json().then((data) => {
        const myText = MeshBuilder.CreateText('myText', 'Hello World !! @ #$ % é', data, {
          size: 16,
          resolution: 64,
          depth: 10
        })
      })
    })

    return scene;
  }
}