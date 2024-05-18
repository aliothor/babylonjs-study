import { AbstractMesh, ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Ray, RayHelper, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class GetMeshHistByRay {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Get Mesh Hist By Ray'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const ground = MeshBuilder.CreateGround('ground', {width: 100, height: 100, subdivisions: 10})

    const box = MeshBuilder.CreateBox('box', {size: 4});
    box.position.y = 2
    box.scaling.z = 2
    const matBox = new StandardMaterial('matBox')
    matBox.diffuseColor = new Color3(1, 0.1, 0.1)
    box.material = matBox
    box.isPickable = false

    const box2 = MeshBuilder.CreateBox('box2', {size: 8})
    box2.position = new Vector3(-20, 4, 0)
    const matBox2 = new StandardMaterial('matBox2')
    matBox2.diffuseColor = new Color3(0.1, 0.1, 1)
    box2.material = matBox2

    const box3 = box2.clone()
    box3.position.x -= 20

    const box4 = MeshBuilder.CreateBox('box4', {size: 8})
    box4.position = new Vector3(0, 4, 30)
    const matBox4 = new StandardMaterial('matBox4')
    matBox4.diffuseColor = new Color3(0.1, 1, 0.1)
    box4.material = matBox4

    scene.onPointerMove = function() {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY)
      if (pickResult.hit && pickResult.pickedPoint) {
        const diffX = pickResult.pickedPoint.x - box.position.x
        const diffY = pickResult.pickedPoint.z - box.position.z
        box.rotation.y = Math.atan2(diffX, diffY)
      }
    }

    function vecToLocal(vector: Vector3, mesh: Mesh) {
      const m = mesh.getWorldMatrix()
      const v = Vector3.TransformCoordinates(vector, m)
      return v
    }

    function predicate(mesh: AbstractMesh) {
      if (mesh == box || mesh == box2) {
        return false
      }
      return true
    }

    function castRay() {
      const origin = box.position
      let forward = new Vector3(0, 0, 1)
      forward = vecToLocal(forward, box)

      let direction = forward.subtract(origin)
      direction = Vector3.Normalize(direction)

      const length = 100
      const ray = new Ray(origin, direction, length)

      // const rayHelper = new RayHelper(ray)
      // rayHelper.show(scene)

      // single
      // const hit = scene.pickWithRay(ray, predicate)
      // if (hit?.pickedMesh) {
      //   hit.pickedMesh.scaling.y += 0.01
      // }

      // multi
      // const hits = scene.multiPickWithRay(ray)
      // if (hits) {
      //   hits.forEach(pf => {
      //     if (pf.pickedMesh) {
      //       pf.pickedMesh.scaling.y += 0.01
      //     }
      //   })
      // }

      // ray
      let r = new Ray(origin, new Vector3(0, 0, 1), length)
      r = Ray.Transform(r, box.getWorldMatrix())
      const hit = r.intersectsMesh(box2, true) 
      if (hit.pickedMesh) {
        hit.pickedMesh.scaling.y += 0.01
      }
    }

    scene.onBeforeRenderObservable.add(() => {
      castRay()
    })
    

    return scene;
  }
}