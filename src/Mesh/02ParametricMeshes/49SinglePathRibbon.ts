import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class SinglePathRibbon {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Single Path Ribbon'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 45, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    const pathHelix = [];
    let v;
    for (let i = 0; i <= 60; i++) {
      v = (2.0 * Math.PI * i) / 20;
      pathHelix.push(new Vector3(3 * Math.cos(v), i / 4, 3 * Math.sin(v)));
    }
    const helix = MeshBuilder.CreateLines('helix', {points: pathHelix})
    helix.color = Color3.Red()

    // offset(default = pathAray.length / 2), 10, 5, 20
    const ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: [pathHelix],
      offset: 20
    })
    ribbon.material = new StandardMaterial('mat')
    ribbon.material.wireframe = true

    return scene;
  }
}