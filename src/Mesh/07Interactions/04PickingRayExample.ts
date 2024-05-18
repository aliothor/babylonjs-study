import { ArcRotateCamera, Color4, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, SceneLoader, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import 'babylonjs-loaders'

export default class PickingRayExample {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Picking Ray Example'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 3

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.2, 0.59, 0.67, 1)

    function createGUIButton() {
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
      const btn = Button.CreateSimpleButton('btn', 'Cannon Selected')
      btn.width = '150px'
      btn.height = '40px'
      btn.color = 'white'
      btn.background = 'green'
      btn.cornerRadius = 5
      btn.onPointerUpObservable.add(function() {
        adt.dispose()
      })
      btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
      adt.addControl(btn)
    }

    SceneLoader.ImportMesh('', 'https://piratejc.github.io/assets/pirateFort/', 'cannon.glb', scene, function(meshes) {
      scene.getMeshByName('cannon')!.metadata = 'cannon'

      scene.onPointerDown = function castRay() {
        const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera)
        const hit = scene.pickWithRay(ray)
        if (hit?.pickedMesh && hit.pickedMesh.metadata == 'cannon') {
          createGUIButton()
        }
      }
    })

    return scene;
  }
}