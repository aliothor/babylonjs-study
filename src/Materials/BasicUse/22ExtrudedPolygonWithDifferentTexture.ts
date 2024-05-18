import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";
import * as earcut from 'earcut'
(window as any).earcut = earcut

export default class ExtrudedPolygonWithDifferentTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extruded Polygon With Different Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);

    // wall
    const wallData = [
      new Vector3(-3.5, 0, -2.5),
      new Vector3(0.5, 0, -2.5),
      new Vector3(0.5, 0, -0.5),
      new Vector3(1.5, 0, -0.5),
      new Vector3(1.5, 0, -2.5),
      new Vector3(3.5, 0, -2.5), 
      new Vector3(3.5, 0, 2.5), 
      new Vector3(-3.5, 0, 2.5)
    ]

    const holes = [];
    holes[0] = [ 
      new Vector3(-2.5, 0, -2),
      new Vector3(-0.5, 0, -2),
      new Vector3(-0.5, 0, -0.5),
      new Vector3(-2.5, 0, -0.5)
    ]
    holes[1] = [ 
      new Vector3(-3.0, 0, 0.75),
      new Vector3(-1.5, 0, 0.75),
      new Vector3(-1.5, 0, 1.75),
      new Vector3(-3.0, 0, 1.75)
    ]
    holes[2] = [ 
      new Vector3(0, 0, 0.75),
      new Vector3(1.5, 0, 0.75),
      new Vector3(1.5, 0, 1.75),
      new Vector3(0, 0, 1.75)
    ]
    holes[3] = [ 
      new Vector3(2, 0, 0.75),
      new Vector3(3, 0, 0.75),
      new Vector3(3, 0, 1.75),
      new Vector3(2, 0, 1.75)
    ]

    const wallFaceUV = new Array<Vector4>(3)
    wallFaceUV[0] = new Vector4(0, 0, 7 / 15, 1)
    wallFaceUV[1] = new Vector4(14 / 15, 0, 1, 1)
    wallFaceUV[2] = new Vector4(7 / 15, 0, 14 / 15, 1)

    const wallMat = new StandardMaterial('wallMat')
    wallMat.diffuseTexture = new Texture('/Materials/wall.jpeg')

    const wall = MeshBuilder.CreatePolygon('wall', {
      shape: wallData,
      depth: 0.15,
      holes: holes,
      faceUV: wallFaceUV
    })
    wall.rotation.x = -Math.PI / 2
    wall.material = wallMat

    // floor
    const floorData = [ 
      new Vector3(-3.5, 0, 0), 
      new Vector3(3.5, 0, 0),
      new Vector3(3.5, 0, 1.5),
      new Vector3(2, 0, 1.5),
      new Vector3(2, 0, 2.85),
      new Vector3(3.5, 0, 2.85),
      new Vector3(3.5, 0, 4), 
      new Vector3(-3.5, 0, 4)
    ]

    const floorFaceUV = new Array<Vector4>(3)
    floorFaceUV[0] = new Vector4(0, 0, 0.5, 1)
    floorFaceUV[2] = new Vector4(0.5, 0, 1, 1)

    const floorMat = new StandardMaterial('floorMat')
    floorMat.diffuseTexture = new Texture('/Materials/floor.jpeg')

    const floor = MeshBuilder.CreatePolygon('floor', {
      shape: floorData,
      depth: 0.1,
      faceUV: floorFaceUV
    })
    floor.position.y = 0.21
    floor.position.z = 0.15
    floor.material = floorMat

    // stairs
    const stairsDepth = 2
    const stairsHeight = 2.5
    const stairsThickness = 0.05
    const nStairs = 12
    const stairs = []
    let x = 0, z = 0
    // up
    stairs.push(new Vector3(x, 0, z))
    z += stairsHeight / nStairs - stairsThickness
    stairs.push(new Vector3(x, 0, z))
    for (let i = 0; i < nStairs; i++) {
      x += stairsDepth / nStairs
      stairs.push(new Vector3(x, 0, z))
      z += stairsHeight / nStairs
      stairs.push(new Vector3(x, 0, z))
    }
    x += stairsDepth / nStairs - stairsThickness
    stairs.push(new Vector3(x, 0, z))
    z += stairsThickness
    stairs.push(new Vector3(x, 0, z))
    // down
    for (let i = 0; i <= nStairs; i++) {
      x -= stairsDepth / nStairs
      stairs.push(new Vector3(x, 0, z))
      z -= stairsHeight / nStairs
      stairs.push(new Vector3(x, 0, z))
    }

    const stairsFaceColors = [
      new Color4(0.5, 0.5, 0.5, 1),
      new Color4(1, 0, 0, 1),
      new Color4(0.5, 0.5, 0.5, 1)
    ]
    
    const stairsCase = MeshBuilder.CreatePolygon('stairsCase', {
      shape: stairs,
      depth: 1.5,
      faceColors: stairsFaceColors
    })
    stairsCase.position = new Vector3(3.5, -2.5, 0.89)
    stairsCase.rotation.x = -Math.PI / 2
    stairsCase.rotation.y = -Math.PI / 2

    return scene;
  }
}