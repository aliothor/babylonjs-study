import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class SimpleExampleDecals {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simple Example of Decals'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const url = 'https://playground.babylonjs.com/'
    SceneLoader.ImportMesh("Shcroendiger'scat", url + 'scenes/', 'SSAOcat.babylon', scene, (nMeshes) => {
      const cat = nMeshes[0]
      camera.target = cat.position

      const decalMat = new StandardMaterial('decalMat')
      decalMat.diffuseTexture = new Texture(url + 'textures/impact.png')
      decalMat.diffuseTexture.hasAlpha = true
      decalMat.zOffset = -1

      const onPointerDown = (evt: PointerEvent) => {
        if (evt.button != 0) return
        // check pick mesh
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == cat)
        if (pickInfo.hit) {
          const decalSize = new Vector3(10, 10, 10)
          // create decal
          const decal = MeshBuilder.CreateDecal('decal', cat, {
            position: pickInfo.pickedPoint!,
            normal: pickInfo.getNormal(true)!,
            size: decalSize
          })
          decal.material = decalMat
        }
      }

      this.canvas.addEventListener('pointerdown', onPointerDown, undefined)
      scene.onDispose = () => {
        this.canvas.removeEventListener('pointerdown', onPointerDown)
      }
    })

    return scene;
  }
}