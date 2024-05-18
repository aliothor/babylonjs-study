import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sound, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "babylonjs-gui";

export default class SpritePlaying {
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

    // const sounds = new Sound(
    //   'Violons',
    //   'https://playground.babylonjs.com/sounds/6sounds.mp3',
    //   scene,
    //   null,
    //   {loop: false, autoplay: true, offset: 14.0, length: 9.2}
    // );

    const sounds = new Sound(
      'Violons',
      'https://playground.babylonjs.com/sounds/6sounds.mp3'
    );
    
    let isPlaying = false;

    const soundArray = [
      [0.0, 5.0],
      [5.1, 6.6],
      [12.0, 1.6],
      [14.0, 9.2],
      [23.0, 7.9],
      [31.0, 2.8]
    ];

    sounds.onended = function() {
      isPlaying = false;
      console.log('not playing');
    }

    // UI
    const advTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const uiPanel = new StackPanel();
    uiPanel.width = '220px';
    uiPanel.fontSize = '14px';
    uiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    uiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    advTexture.addControl(uiPanel);

    // button
    let button = Button.CreateSimpleButton('but0', 'Play all sounds');
    button.paddingTop = '10px';
    button.width = '150px';
    button.height = '40px';
    button.color = 'white';
    button.background = 'green';
    button.onPointerClickObservable.add(() => {
      if (!isPlaying) {
        isPlaying = true;
        sounds.play();
      }
    });
    uiPanel.addControl(button);

    for (let i = 0; i < soundArray.length; i++) {
      let button = Button.CreateSimpleButton('but' + i + 1, `Play ${i+1} sounds`);
      button.paddingTop = '10px';
      button.width = '150px';
      button.height = '40px';
      button.color = 'white';
      button.background = 'green';
      button.onPointerClickObservable.add(() => {
        if (!isPlaying) {
          isPlaying = true;
          sounds.play(0, soundArray[i][0], soundArray[i][1]);
        }
      });
      uiPanel.addControl(button);
    }

    return scene;
  }
}