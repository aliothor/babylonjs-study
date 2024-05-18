import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Nullable, PointerEventTypes, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Checkbox, Control } from "babylonjs-gui";

export default class DecalsWithRiggedMovingMeshes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Decals With Rigged and Moving Meshes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 120, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const factor = 30

    const box = MeshBuilder.CreateBox('box', {size: 0.3 * factor});
    box.position.x = factor
    box.position.y = 0.4 *factor

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.5 * factor})
    sphere.position.x = -0.3 * factor
    sphere.position.y = factor
    sphere.parent = box

    const decalSize = new Vector3(0.25 * factor, 0.25 * factor, factor)

    const projector = MeshBuilder.CreateBox('projector', {width: decalSize.x, height: decalSize.y, depth: decalSize.z})
    projector.material = new StandardMaterial('projectorMat')
    projector.material.alpha = 0
    projector.enableEdgesRendering(0.99)
    projector.edgesWidth = 20
    projector.visibility = 0

    SceneLoader.ImportMeshAsync('', 'https://playground.babylonjs.com/scenes/Dude/', 'Dude.babylon').then((result) => {
      camera.target.y = 30
      // animation
      scene.stopAllAnimations()
      const skeleton = scene.skeletons[0]
      scene.beginAnimation(skeleton, 0, 100, true)

      const decalMat = new StandardMaterial('decalMat')
      decalMat.diffuseTexture = new Texture('/Meshes/t4.png')
      decalMat.diffuseTexture.hasAlpha = true
      decalMat.zOffset = -2

      // decal
      let decal: Nullable<Mesh> = null
      let isHovering = false
      let angle = 0
      let cullBackFaces = true

      const createDecal = () => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh.skeleton != null || mesh == sphere || mesh == box)
        isHovering = pickResult.hit
        if (pickResult.hit) {
          projector.visibility = 1
          if (decal) {
            decal.dispose()
            decal = null
          }

          const normal = scene.activeCamera!.getForwardRay().direction.negateInPlace().normalize()
          const position = pickResult.pickedPoint!
          const soureMesh = pickResult.pickedMesh!

          decal = MeshBuilder.CreateDecal('decal', soureMesh, {position, normal, angle, size: decalSize, cullBackFaces, localMode: true})
          decal.material = decalMat

          const yaw = -Math.atan2(normal.z, normal.x) - Math.PI / 2
          const len = Math.sqrt(normal.x * normal.x + normal.z * normal.z)
          const pitch = Math.atan2(normal.y, len)

          projector.position.copyFrom(position)
          projector.rotation.set(pitch, yaw, angle)
        } else {
          if (decal) decal.visibility = 0
          projector.visibility = 0
        }
      }

      const delay = 5
      let count = 0
      scene.onPointerMove = function() {
        if (count == 0) {
          createDecal()
        }
        count = (count + 1) % delay
      }

      let rmbDown = false
      let animateCube = true
      let t = 0
      scene.onBeforeRenderObservable.add(() => {
        if (rmbDown) {
          angle += 0.025
          createDecal()
        }
        if (animateCube && box) {
          box.rotation.z = Math.sin(t) / 2
          t += 0.01
        }
      })

      scene.onPointerObservable.add((evtData) => {
        switch (evtData.type) {
          case PointerEventTypes.POINTERUP:
            if (evtData.event.button == 2) {
              rmbDown = false
            }
            if (isHovering && decal && evtData.event.button == 0) {
              decal.clone('decal_cloned')
            }
            break
          case PointerEventTypes.POINTERDOWN:
            if (evtData.event.button == 2) {
              rmbDown = true
            }
            break
        }
      })

      // gui
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
      const sp = Checkbox.AddCheckBoxWithHeader('Cull back faces of decal', (value) => {
        cullBackFaces = value
      })
      adt.addControl(sp)
      sp.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
      sp.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      (sp.children[0] as Checkbox).isChecked = cullBackFaces
      sp.children[1].width = '230px'

    })

    return scene;
  }
}