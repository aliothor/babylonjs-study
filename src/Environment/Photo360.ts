import { ActionManager, ArcRotateCamera, Engine, ExecuteCodeAction, HemisphericLight, MeshBuilder, PhotoDome, PointerEventTypes, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class Photo360 {
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
    camera.inputs.attached.mousewheel.detachControl();

    // https://playground.babylonjs.com/textures/360photo.jpg
    // https://playground.babylonjs.com/textures/sidexside.jpg
    // https://playground.babylonjs.com/textures/topbottom.jpg
    const dome = new PhotoDome(
      'dome',
      'https://playground.babylonjs.com/textures/topbottom.jpg',
      {
        resolution: 32,
        size: 1000,
        // useDirectMapping: false
      },
      scene
    );
    // dome.imageMode = PhotoDome.MODE_MONOSCOPIC;
    // dome.imageMode = PhotoDome.MODE_SIDEBYSIDE;
    dome.imageMode = PhotoDome.MODE_TOPBOTTOM;

    let tickCout = -240, zoomLevel = 1;
    scene.registerAfterRender(() => {
      tickCout++;
      if (zoomLevel == 1) {
        if (tickCout >= 0) {
          dome.fovMultiplier = Math.sin(tickCout / 100) * 0.5 + 1;
        }
      } else {
        dome.fovMultiplier = zoomLevel;
      }
    });

    scene.onPointerObservable.add((e) => {
      if (dome == undefined) return;
      zoomLevel += e.event.wheelDelta * -0.0005;
      if (zoomLevel < 0) zoomLevel = 0;
      if (zoomLevel > 2) zoomLevel = 2;
      if (zoomLevel == 1) {
        tickCout = -60;
      }
    }, PointerEventTypes.POINTERWHEEL);

    const vrHelper = scene.createDefaultVRExperience();

    scene.actionManager = new ActionManager();
    scene.actionManager.registerAction(
      new ExecuteCodeAction({
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: 's'
      }, () => {
        vrHelper.enterVR();
      })
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction({
        trigger: ActionManager.OnKeyDownTrigger,
        parameter: 'e'
      }, () => {
        vrHelper.exitVR();
        document.exitFullscreen();
      })
    );

    return scene;
  }
}