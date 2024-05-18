import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, PointerEventTypes, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class PickAndColor {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Pick and Color'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const goldberg = MeshBuilder.CreateGoldberg('g', { m: 5, n: 2 });
    goldberg.setGoldbergFaceColors([[0, 11, new Color4(1, 1, 0, 1)]])
    // goldberg.material = new StandardMaterial('')
    // goldberg.material.wireframe = true

    function getFaceNbFromFacetId(fid: number) {
      if (fid < 36) {
        return Math.floor(fid / 3)
      } else {
        return Math.floor((fid - 36) / 4) + 12
      }
    }

    scene.onPointerObservable.add(pointerInfo => {
      if (pointerInfo.type == PointerEventTypes.POINTERUP) {
        if (pointerInfo.pickInfo?.hit) {
          const faceId = pointerInfo.pickInfo.faceId
          const f = getFaceNbFromFacetId(faceId)
          goldberg.setGoldbergFaceColors([[f, f, new Color4(1, 0, 0, 1)]])
        }
      }
    })

    return scene;
  }
}