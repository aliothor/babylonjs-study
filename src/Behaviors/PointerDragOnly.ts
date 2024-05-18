import { ArcRotateCamera, Axis, Engine, HemisphericLight, MeshBuilder, PointerDragBehavior, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class PointerDragOnly {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
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
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box');
    box.position.y = 0.5;
    box.rotation.y = Math.PI / 2;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // const pointerDragBehavior = new PointerDragBehavior();
    const pointerDragBehavior = new PointerDragBehavior({dragAxis: Axis.X});
    // const pointerDragBehavior = new PointerDragBehavior({dragPlaneNormal: Axis.Y});

    pointerDragBehavior.useObjectOrientationForDragging = false;
    pointerDragBehavior.updateDragPlane = false;

    pointerDragBehavior.onDragStartObservable.add((event) => {
      console.log("dragStart");
      console.log(event);
    });
    pointerDragBehavior.onDragObservable.add((event) => {
      console.log("drag");
      console.log(event);
    });
    pointerDragBehavior.onDragEndObservable.add((event) => {
      console.log("dragEnd");
      console.log(event);
    });

    // pointerDragBehavior.moveAttached = false;
    pointerDragBehavior.enabled = false;

    box.addBehavior(pointerDragBehavior);

    return scene;
  }
}