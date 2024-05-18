import { ArcRotateCamera, Axis, Engine, HemisphericLight, MeshBuilder, PointerDragBehavior, Scene, SceneLoader, SurfaceMagnetismBehavior, Vector3 } from "babylonjs";

export default class FollowMagnetism {
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

    const box0 = MeshBuilder.CreateBox('box0');
    box0.position.x = 2;
    box0.position.y = 0.5;

    const box = MeshBuilder.CreateBox('box');
    box.position.y = 0.5;
    // box.rotation.y = Math.PI / 2;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // const pointerDragBehavior = new PointerDragBehavior();
    // const pointerDragBehavior = new PointerDragBehavior({dragAxis: Axis.X});
    const pointerDragBehavior = new PointerDragBehavior({dragPlaneNormal: Axis.Y});

    pointerDragBehavior.useObjectOrientationForDragging = false;
    pointerDragBehavior.updateDragPlane = false;

    // box.addBehavior(pointerDragBehavior);

    // 磁性
    const smBehavior = new SurfaceMagnetismBehavior();
    smBehavior.attach(box);
    smBehavior.meshes = [box0];
    box.addBehavior(smBehavior);

    return scene;
  }
}