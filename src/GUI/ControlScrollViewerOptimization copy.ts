import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Checkbox, Container, Control, ScrollViewer, TextBlock } from "babylonjs-gui";

export default class ControlScrollViewerOptimization {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 网格
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const sv = new ScrollViewer();
    sv.width = 0.7;
    sv.height = 0.8;
    sv.background = 'orange';
    sv.forceHorizontalBar = true;
    sv.forceVerticalBar = true;
    adt.addControl(sv);

    const cwidth = 10000, cheight = 10000;
    const numButtons = 2000;
    const colors = ['red', 'blue', 'green', 'yellow', 'white', 'lightgreen'];

    const main = new Container();
    main.width = cwidth + 'px';
    main.height = cheight + 'px';
    sv.addControl(main);

    for (let i = 0; i< numButtons; i++) {
      const btn = Button.CreateSimpleButton(`btn${i}`, `Button ${i}`);
      btn.width = '100px';
      btn.height = '30px';
      btn.fontSize = 12;
      btn.background = colors[Math.floor(Math.random() * colors.length)];
      btn.left = Math.random() * cwidth + 'px';
      btn.top = Math.random() * cheight + 'px';
      btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      main.addControl(btn);
    }


    const bucket = Checkbox.AddCheckBoxWithHeader('use buckets', (value) => {
      sv.setBucketSizes(value ? 110 : 0, value ? 40 : 0);
    });
    (bucket.children[0] as Checkbox).isChecked = false;
    bucket.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    bucket.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    bucket.top = '30px';
    bucket.left = '20px';
    adt.addControl(bucket);
    
    const freeze = Checkbox.AddCheckBoxWithHeader('freeze controls', (value) => {
      sv.freezeControls = value;
      bucket.children[0].isEnabled = value;
    });
    (freeze.children[0] as Checkbox).isChecked = false;
    freeze.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    freeze.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    freeze.top = '5px';
    freeze.left = '5px';
    adt.addControl(freeze);

    const stats = new TextBlock();
    stats.top = '60px';
    stats.left = '5px';
    stats.text = '';
    stats.width = '300px';
    stats.color = 'white';
    stats.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stats.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    stats.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    stats.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    adt.addControl(stats);

    scene.onBeforeRenderObservable.add(() => adt.markAsDirty());

    scene.onAfterRenderObservable.add(() => {
      stats.text = adt.numLayoutCalls + ' layout calls, ' + adt.numRenderCalls + ' render calls';
    });

    return scene;
  }
}