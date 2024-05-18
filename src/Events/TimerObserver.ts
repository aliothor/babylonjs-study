import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, setAndStartTimer, Vector3 } from "babylonjs";

export default class TimerObserver {
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

    // setTimeout(() => {
    //   light.diffuse = Color3.Blue();
    // }, 3000);

    // setAndStartTimer({
    //   timeout: 5000,
    //   contextObservable: scene.onBeforeRenderObservable,
    //   onEnded: () => {
    //     light.diffuse = Color3.Red();
    //   }
    // });

    let pressed = false;
    scene.onPointerDown = function() {
      pressed = true;
      // 启动定时器
      setAndStartTimer({
        timeout: 6000,
        contextObservable: scene.onBeforeRenderObservable,
        breakCondition: () => {
          return !pressed;
        },
        onAborted: () => {
          light.diffuse.set(0, 0, 0);
        },
        onEnded: () => {
          light.diffuse = Color3.Purple();
        },
        onTick: (data) => {
          light.diffuse.set(0, data.completeRate, 0);
        }
      });
    }

    scene.onPointerUp = function() {
      pressed = false;
    }

    return scene;
  }
}