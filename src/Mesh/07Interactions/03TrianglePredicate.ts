import { ArcRotateCamera, Color3, Color4, Engine, Mesh, MeshBuilder, PointLight, PointerEventTypes, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class TrianglePredicate {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Triangle Predicate'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(0, 0, 0), scene);

    const faceColors: Color4[] = []
    faceColors.push(new Color4(1, 0, 0, 1))
    faceColors.push(new Color4(0, 1, 0, 1))
    faceColors.push(new Color4(0, 0, 1, 1))
    faceColors.push(new Color4(0, 1, 1, 1))
    faceColors.push(new Color4(1, 0, 1, 1))
    faceColors.push(new Color4(1, 1, 0, 1))

    const room = MeshBuilder.CreateBox('room', {
      size: 10,
      faceColors,
      sideOrientation: Mesh.BACKSIDE
    });
    room.isPickable = true
    const box = MeshBuilder.CreateBox('box')
    box.material = new StandardMaterial('mat')
    box.material.emissiveColor = new Color3(0.5, 0.5, 0.5)
    box.isPickable = true

    function onPointerDown() {
      const pick = scene.pick(scene.pointerX, scene.pointerY, undefined, false, undefined, (p0, p1, p2, ray) => {
        const p0p1 = p0.subtract(p1)
        const p2p1 = p2.subtract(p1)
        const normal = Vector3.Cross(p0p1, p2p1)
        return (Vector3.Dot(ray.direction, normal) < 0)
      })
      if (pick.hit) {
        console.log(pick.pickedMesh?.name);
        
      }
    }

    scene.onPrePointerObservable.add(onPointerDown, PointerEventTypes.POINTERDOWN)

    scene.onDispose = function() {
      scene.onPrePointerObservable.removeCallback(onPointerDown)
    }

    return scene;
  }
}