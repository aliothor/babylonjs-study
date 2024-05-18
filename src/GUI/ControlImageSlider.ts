import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Tools, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Grid, Image, ImageBasedSlider, Slider, StackPanel, TextBlock } from "babylonjs-gui";

export default class ControlImageSlider {
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

    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const grid = new Grid();
    adt.addControl(grid);

    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addColumnDefinition(0.25);
    grid.addRowDefinition(0.25);
    grid.addRowDefinition(0.25);
    grid.addRowDefinition(0.25);
    grid.addRowDefinition(0.25);

    // slider
    const addSlider = function(isVertical: boolean, isClamped: boolean, displayThumb: boolean, row: number, col: number) {
      const panel = new StackPanel();
      panel.width = '220px';
      grid.addControl(panel, row, col);

      const header = new TextBlock();
      header.text = 'Y-rotation: 0 deg';
      header.height = '30px';
      header.color = 'white';
      panel.addControl(header);

      const slider = new Slider();
      slider.minimum = 0;
      slider.maximum = 2 * Math.PI;
      slider.isThumbClamped = isClamped;
      slider.isVertical = isVertical;
      slider.displayThumb = displayThumb;

      if (isVertical) {
        slider.width = '20px';
        slider.height = '80px';
      } else {
        slider.height = '20px';
        slider.width = '200px';
      }
      slider.color = 'red';
      slider.onValueChangedObservable.add((value) => {
        header.text = `Y-rotation: ${Tools.ToDegrees(value) | 0} deg`;
      });
      slider.value = Math.PI + Math.PI * Math.random();
      panel.addControl(slider);
    }

    addSlider(false, true, true, 0, 0);
    addSlider(true, true, true, 1, 0);

    addSlider(false, false, true, 0, 1);
    addSlider(true, false, true, 1, 1);

    addSlider(false, true, false, 2, 0);
    addSlider(true, true, false, 3, 0);

    addSlider(false, false, false, 2, 1);
    addSlider(true, false, false, 3, 1);

    // ImageBasedSlider
    const addImageSlider = function(isVertical: boolean, isClamped: boolean, displayThumb: boolean, row: number, col: number) {
      const panel = new StackPanel();
      panel.width = '220px';
      grid.addControl(panel, row, col);

      const header = new TextBlock();
      header.text = 'Rotation: 0 deg';
      header.height = '30px';
      header.color = 'white';
      panel.addControl(header);

      const slider = new ImageBasedSlider();
      slider.minimum = 0;
      slider.maximum = 2 * Math.PI;
      slider.isThumbClamped = isClamped;
      slider.isVertical = isVertical;
      slider.displayThumb = displayThumb;

      const url = 'https://playground.babylonjs.com/textures/gui/';
      if (isVertical) {
        slider.width = '20px';
        slider.height = '80px';
        slider.backgroundImage = new Image('bg', `${url}backgroundImage-vertical.png`);
        slider.valueBarImage = new Image('value', `${url}valueImage-vertical.png`);
      } else {
        slider.height = '20px';
        slider.width = '200px';
        slider.backgroundImage = new Image('bg', `${url}backgroundImage.png`);
        slider.valueBarImage = new Image('value', `${url}valueImage.png`);
      }
      slider.thumbImage = new Image('thumb', `${url}thumb.png`);
      
      slider.onValueChangedObservable.add((value) => {
        header.text = `Rotation: ${Tools.ToDegrees(value) | 0} deg`;
      });
      slider.value = Math.PI + Math.PI * Math.random();
      panel.addControl(slider);
    }

    addImageSlider(false, true, true, 0, 2);
    addImageSlider(true, true, true, 1, 2);

    addImageSlider(false, false, true, 0, 3);
    addImageSlider(true, false, true, 1, 3);

    addImageSlider(false, true, false, 2, 2);
    addImageSlider(true, true, false, 3, 2);

    addImageSlider(false, false, false, 2, 3);
    addImageSlider(true, false, false, 3, 3);

    return scene;
  }
}