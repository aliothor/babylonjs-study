import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PBRMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";
import { Button3D, CylinderPanel, GUI3DManager, MeshButton3D, StackPanel3D, TextBlock } from "babylonjs-gui";
import 'babylonjs-loaders';

export default class StereoControlButton {
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
    camera.wheelDeltaPercentage = 0.01;
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 30;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box');

    // 3D GUI 
    const manager = new GUI3DManager();

    // button3D
    const bPanel = new StackPanel3D();
    manager.addControl(bPanel);
    const button = new Button3D('btn');
    bPanel.addControl(button);
    bPanel.position.z = -3;
    bPanel.scaling = new Vector3(2, 2, 1);
    // 文本
    const txt = new TextBlock();
    txt.text = 'Button3D';
    txt.color = 'white';
    txt.fontSize = 36;
    button.content = txt;

    // meshbutton
    const mPanel = new CylinderPanel();
    mPanel.margin = 0.75;
    manager.addControl(mPanel);

    let pushButtonCore: Mesh;
    let index = 0;
    SceneLoader.ImportMesh(
      '',
      'https://david.blob.core.windows.net/babylonjs/MRTK/',
      'pushButton.glb',
      scene,
      (meshes) => {
        pushButtonCore = meshes[0] as Mesh;
        makeButtons();
        pushButtonCore.setEnabled(false);
      }
    );

    const makePushButton = function(mesh: Mesh, hoverColor: Color3) {
      const cylinder = mesh.getChildMeshes(false, (node) => {
        return node.name.indexOf('Cylinder') != -1;
      })[0];
      const cylinderMat = cylinder.material?.clone(`cMat${index}`) as PBRMaterial;
      cylinderMat.albedoColor = new Color3(0.5, 0.19, 0);
      cylinder.material = cylinderMat;
      const pushButton = new MeshButton3D(mesh, `pushBtn${index}`);

      pushButton.pointerEnterAnimation = () => {
        cylinderMat.albedoColor = hoverColor;
      }
      pushButton.pointerOutAnimation = () => {
        cylinderMat.albedoColor = new Color3(0.5, 0.19, 0);
      }
      pushButton.pointerDownAnimation = () => {
        cylinder.position.y = 0;
      }
      pushButton.pointerUpAnimation = () => {
        cylinder.position.y = 0.21;
      }
      pushButton.onPointerDownObservable.add(() => {
        txt.text = pushButton.name + '';
      });

      mPanel.addControl(pushButton);
      index++;
    }

    const makeButtons = function() {
      let color: Color3;
      let newBtn;
      const colors = [
        {r: 0.25, g: 0, b: 0},
        {r: 0, g: 0.25, b: 0},
        {r: 0, g: 0, b: 0.25},
        {r: 0.25, g: 0.25, b: 0}, 
        {r: 0, g: 0.25, b: 0.25}, 
        {r: 0.25, g: 0, b: 0.25}
      ];

      mPanel.blockLayout = true;
      for (let i = 0; i < 10; i++) {
        newBtn = pushButtonCore.clone('pushBtn' + index);
        color = new Color3(colors[i % 6].r, colors[i % 6].g, colors[i % 6].b);
        makePushButton(newBtn, color);
      }
      mPanel.blockLayout = false;
    }
    

    return scene;
  }
}