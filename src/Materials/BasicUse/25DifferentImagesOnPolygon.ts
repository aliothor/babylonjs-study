import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class DifferentImagesOnPolygon {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Different Images On A Polygon'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const light1 = new HemisphericLight('light1', new Vector3(0, -1, 0), scene)

    const shape = [ 
      new Vector3(4, 0, -4), 
      new Vector3(2, 0, 0), 
      new Vector3(5, 0, 2), 
      new Vector3(1, 0, 2), 
      new Vector3(-5, 0, 5), 
      new Vector3(-3, 0, 1), 
      new Vector3(-4, 0, -4), 
      new Vector3(-2, 0, -3), 
      new Vector3(2, 0, -3)
    ];

    const holes = [];
    holes[0] = [ 
      new Vector3(1, 0, -1),
      new Vector3(1.5, 0, 0),
      new Vector3(1.4, 0, 1),
      new Vector3(0.5, 0, 1.5)
    ];
    holes[1] = [ 
      new Vector3(0, 0, -2),
      new Vector3(0.5, 0, -1),
      new Vector3(0.4, 0, 0),
      new Vector3(-1.5, 0, 0.5)
    ];

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/fourdivisions.png')

    const f = new Vector4(0, 0, 0.5, 1)
    const b = new Vector4(0.5, 0, 1, 1)

    const polygon1 = MeshBuilder.CreatePolygon('p1', {
      shape: shape,
      holes: holes,
      sideOrientation: Mesh.DOUBLESIDE
    })
    polygon1.position.y = 4
    polygon1.material = mat

    const polygon2 = MeshBuilder.CreatePolygon('p2', {
      shape: shape,
      holes: holes,
      sideOrientation: Mesh.DOUBLESIDE,
      frontUVs: f,
      backUVs: b
    })
    polygon2.position.y = -4
    polygon2.material = mat

    return scene;
  }
}