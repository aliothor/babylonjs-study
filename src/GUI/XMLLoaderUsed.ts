import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, XmlLoader } from "babylonjs-gui";

export default class XMLLoaderUsed {
  engine: Engine;
  scene: Scene;
  textWidth = '300px';
  storeUsernameEvent;

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

    const xmlLoader = new XmlLoader(this);
    xmlLoader.loadLayout('GUI/basic.xml', adt, () => {
      xmlLoader.getNodeById('imageButton').onPointerClickObservable.add(() => {
        alert('Welcome !');
      });
    });

    this.storeUsernameEvent = function() {
      alert('storeUsernameEvent');
    }

    return scene;
  }
}