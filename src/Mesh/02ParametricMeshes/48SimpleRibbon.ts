import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class SimpleRibbon {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simple Ribbon'
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

    const myPoints1 = [
      new Vector3(.1, .0, 0),
      new Vector3(.1, .1, 0),
      new Vector3(.2, .1, 0),
      new Vector3(.2, .2, 0),
      new Vector3(.3, .2, 0),
      new Vector3(.3, .3, 0),
      new Vector3(.4, .3, 0),
      new Vector3(.4, .4, 0),
    ]

    const line1 = MeshBuilder.CreateLines('line1', {points: myPoints1})

    const myPoints2 = [
      new Vector3(.1, .0, 1),
      new Vector3(.1, .1, 1),
      new Vector3(.2, .1, 1),
      new Vector3(.2, .2, 1),
      new Vector3(.3, .2, 1),
      new Vector3(.3, .3, 1),
      new Vector3(.4, .3, 1),
      new Vector3(.4, .4, 1),
    ]

    const line2 = MeshBuilder.CreateLines('line2', {points: myPoints2})

    const stairs = MeshBuilder.CreateRibbon('stairs', {
      pathArray: [myPoints1, myPoints2],
      sideOrientation: Mesh.DOUBLESIDE
    })
    stairs.material = new StandardMaterial('mat')
    stairs.material.wireframe = true

    return scene;
  }
}