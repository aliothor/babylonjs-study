import { ArcRotateCamera, ClipboardEventTypes, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, SceneSerializer, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class ClipboardUsed {
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
    const textblock = new TextBlock('tb');
    textblock.text = '移动鼠标到球体或盒子上\n然后按下 ctrl/cmd + c 键';
    textblock.fontSize = 24;
    textblock.color = 'white';
    textblock.top = -100;
    adTexture.addControl(textblock);

    // 激活剪切板侦听事件
    adTexture.registerClipboardEvents();

    // 添加事件
    adTexture.onClipboardObservable.add((evt) => {
      // 复制
      if (evt.type == ClipboardEventTypes.COPY) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        if (pick?.hit) {
          const serializeData = SceneSerializer.SerializeMesh(pick.pickedMesh);
          const blob = new Blob([JSON.stringify(serializeData)], {type: 'application/json;charset=utf-8'});
          const url = URL.createObjectURL(blob);
          evt.event.clipboardData?.setData('text/url-list', url);
          textblock.text = '现在按下 ctrl/cmd + v\n创建新的 ' + pick.pickedMesh?.name;
        }
      }
      // 粘贴
      if (evt.type == ClipboardEventTypes.PASTE) {
        if (evt.event.clipboardData!.types.indexOf('text/url-list') > -1) {
          const blobURL = evt.event.clipboardData?.getData('text/url-list');
          SceneLoader.ImportMesh(
            '',
            '',
            blobURL,
            scene,
            (meshes) => {
              const position = new Vector3(
                Math.random() * 10 + Math.random() * -10,
                Math.random() * 10 + Math.random() * -10,
                Math.random() * 10
              );
              meshes[0].position = position;
            }
          );
          textblock.text = '';
        }
      }
    });

    setTimeout(() => {
      textblock.text = '再见  !!!';
      adTexture.unRegisterClipboardEvents();
    }, 10000);

    return scene;
  }
}