import { ArcRotateCamera, ClipboardEventTypes, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, SceneSerializer, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class ClipboardTextUsed {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -20));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox('box', {size: 3});
    box.position.x = 3;

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.position.x = -3;

    // GUI
    const adTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const colors = ['white', 'black', 'red', 'green', 'blue'];

    // 激活剪切板侦听事件
    adTexture.registerClipboardEvents();

    // 添加事件
    adTexture.onClipboardObservable.add((evt) => {
      // 粘贴
      if (evt.type == ClipboardEventTypes.PASTE) {
        const textData = evt.event.clipboardData?.getData('text/plain');
        if (textData) {
          // 创建文本
          const txt = new TextBlock();
          txt.text = textData;
          txt.color = colors[Math.floor(Math.random() * 5)];
          txt.fontSize = Math.random() * 25 + 5;
          txt.rotation = Math.random() * 10;
          txt.top = Math.random() * 100 + Math.random() * -100;
          txt.left = Math.random() * 100 + Math.random() * -100;
          adTexture.addControl(txt);
        } else {
          // 给出提示
          const msg = new TextBlock();
          msg.text = '请复制一些纯文本';
          msg.color = 'red';
          msg.fontSize = 24;
          adTexture.addControl(msg);
          setTimeout(() => {
            msg.dispose();
          }, 2000);
        }
      }
    });

    setTimeout(() => {
      adTexture.unRegisterClipboardEvents();
    }, 30000);

    return scene;
  }
}