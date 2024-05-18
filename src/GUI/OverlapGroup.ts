import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Line } from "babylonjs-gui";

export default class OverlapGroup {
  engine: Engine;
  scene: Scene;
  _buttons: Button[] = [];
  _adt: AdvancedDynamicTexture;

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

    this._adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    this._createMesh(0, 0.1, 0, 1);
    this._createMesh(0.2, 0.1, 1, 1, 0);
    this._createMesh(-0.1, -0.2, 2, 1);
    this._createMesh(-0.2, -0.1, 3, 2);
    this._createMesh(-0.2, 0, 4, 2);
    this._createMesh(0, 0, 5, undefined);
    console.log(this._buttons.length);
    

    this._adt.onBeginRenderObservable.add(() => {
      // this._adt.moveToNonOverlappedPosition();
      // this._adt.moveToNonOverlappedPosition(1);
      // this._adt.moveToNonOverlappedPosition(2);
      this._adt.moveToNonOverlappedPosition(this._buttons);
    });

    return scene;
  }

  private _createMesh(x: number, y: number, i: number, overlapGroup: number | undefined, overlapDeltaMultiplier: number = 1) {
    const sphere = MeshBuilder.CreateSphere(`sphere${i}`);
    sphere.position.x = x;
    sphere.position.y = y;

    const btn = Button.CreateSimpleButton(`btn${i}`, `button-${i}`);
    btn.widthInPixels = 60;
    btn.heightInPixels = 24;
    btn.color = '#fff';
    btn.background = '#000';
    btn.fontWeight = '300';
    btn.fontSizeInPixels = 12;
    btn.alpha = 0.9;
    btn.cornerRadius = 4;
    btn.thickness = 0;
    btn.linkOffsetYInPixels = -60;
    this._adt.addControl(btn);
    btn.linkWithMesh(sphere);


    this._buttons.push(btn);

    // 重叠分组
    btn.overlapGroup = overlapGroup;
    btn.overlapDeltaMultiplier = overlapDeltaMultiplier;

    // 引线
    const line = new Line(`line_${i}`);
    line.lineWidth = 4;
    line.color = '#444';
    line.connectedControl = btn;
    this._adt.addControl(line);

    line.linkWithMesh(sphere);
    line.y2 = 0;
    line.dash = [3, 3];
  }
}