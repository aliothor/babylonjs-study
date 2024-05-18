import { ArcRotateCamera, Color3, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3, WebXRFeatureName } from "babylonjs";
import { GUI3DManager, NearMenu, TouchHolographicButton } from "babylonjs-gui";
import 'babylonjs-loaders';
import { Mesh } from "babylonjs/index";

export default class StereoNearInteractionButton {
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

    const camera = new FreeCamera('camera', new Vector3(0, 1.7, -0.3));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.01;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.3, segments: 32});
    sphere.position = new Vector3(0, 1.7, 0.5);
    const spMat = new StandardMaterial('spMat');
    sphere.material = spMat;

    // 3D GUI
    const manager = new GUI3DManager();

    scene.createDefaultXRExperienceAsync().then((xr) => {
      xr.baseExperience.camera.position = new Vector3(0, 0, -0.3);
      try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, 'latest', {xrInput: xr.input});
      } catch (err) {
        console.log('Articulated hand tracking not supported in this browser.');
      }
      
      manager.useRealisticScaling = true;

      // 创建按钮
      const touchHBtn = new TouchHolographicButton('touchHBtn');
      manager.addControl(touchHBtn);
      touchHBtn.position = new Vector3(0.1, 1.8, 0);
      touchHBtn.text = 'Alert Me';
      touchHBtn.imageUrl = 'https://playground.babylonjs.com/textures/down.png';
      touchHBtn.onPointerDownObservable.add(() => {
        alert('Alert Me');
      });

      const near = new NearMenu('near');
      near.rows = 3;
      manager.addControl(near);
      // near.isPinned = true;
      near.position.y = 1.61;

      this._addNearMenuButtons(near, sphere);

    });

    return scene;
  }
  private _addNearMenuButtons(near: NearMenu, sphere: Mesh) {
    const btn1 = new TouchHolographicButton();
    const btn2 = new TouchHolographicButton();
    const btn3 = new TouchHolographicButton();
    const btn4 = new TouchHolographicButton();
    const btn5 = new TouchHolographicButton();
    const btn6 = new TouchHolographicButton();

    near.addButton(btn1);
    near.addButton(btn2);
    near.addButton(btn3);
    near.addButton(btn4);
    near.addButton(btn5);
    near.addButton(btn6);

    btn1.text = 'Blue';
    btn2.text = 'Red';
    btn3.text = 'Green';
    btn4.text = 'Purple';
    btn5.text = 'Yellow';
    btn6.text = 'Teal';

    btn1.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Blue());
    btn2.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Red());
    btn3.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Green());
    btn4.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Purple());
    btn5.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Yellow());
    btn6.onPointerDownObservable.add(() => sphere.material!.diffuseColor = Color3.Teal());
  }
}