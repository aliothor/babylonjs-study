import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Observable, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class SimpleObserver {
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

    const box = MeshBuilder.CreateBox('box');

    // 创建可观察对象
    const onChange = new Observable();

    const s1 = MeshBuilder.CreateSphere('s1');
    s1.position.z = 5;
    const obs = onChange.add((value: any) => {
      s1.position.x = value / 2;
    });

    const s2 = s1.clone();
    s2.position.z = 9;
    onChange.add((value: any) => {
      s2.position.x = value / 1.5;
    });

    // 动画
    let alpha = 0;
    const obsScene = scene.onBeforeRenderObservable.add(() => {
      box.position.x = Math.sin(alpha) * 3;
      onChange.notifyObservers(box.position.x);
      alpha += 0.01;

      if (scene.onBeforeRenderObservable.hasObservers() && alpha > 5) {
        scene.onBeforeRenderObservable.remove(obsScene);
      }
    });


    return scene;
  }
}