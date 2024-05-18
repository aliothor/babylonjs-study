import { AdvancedTimer, ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class AdvanceTimerObserver {
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

    // *******************************
    // 有问题，正常 end 可以再次启动，abort 之后启动不了
    const adTimer = new AdvancedTimer({
      timeout: 3000,
      contextObservable: scene.onBeforeRenderObservable,
    });

    adTimer.onEachCountObservable.add((data) => {
      light.diffuse.set(0, data.completeRate, 0);
    });

    adTimer.onTimerAbortedObservable.add(() => {
      console.log('abort');
      
      light.diffuse.set(0, 0, 0);
      adTimer.stop();
    });

    adTimer.onTimerEndedObservable.add(() => {
      light.diffuse = Color3.Purple();
    });

    scene.onPointerDown = () => {
      console.log('down');
      adTimer.start();
    }
    scene.onPointerUp = () => {
      console.log('up');
      adTimer.stop();
    }
    return scene;
  }
}