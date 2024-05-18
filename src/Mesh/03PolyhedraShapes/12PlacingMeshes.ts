import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector2, Vector3 } from "babylonjs";

export default class PlacingMeshes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Placing Meshes'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    // const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 2, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.5

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // const box = MeshBuilder.CreateBox('box', {width: 0.1, depth: 0.08, height: 0.4});

    // const g = MeshBuilder.CreateGoldberg('g', {m: 2, n: 1})

    // const faceCenter0 = g.goldbergData.faceCenters[0]
    // const faceCenter1 = g.goldbergData.faceCenters[g.goldbergData.adjacentFaces[0][0]]
    // const radius = faceCenter0.subtract(faceCenter1).length() / 2

    // g.placeOnGoldbergFaceAt(box, 32, new Vector3(0, 0, 0))
    // g.placeOnGoldbergFaceAt(box.clone(), 32, new Vector3(radius, 0.2, 0))

    let m = 5
    let n = 2

    const goldberg = MeshBuilder.CreateGoldberg('g', { m, n })
    const centFace0 = goldberg.goldbergData.faceCenters[0]
    const adjTo0 = goldberg.goldbergData.adjacentFaces[0][0]
    const centFace1 = goldberg.goldbergData.faceCenters[adjTo0]
    const radius = centFace0.subtract(centFace1).length() / 2

    function setFaceColorAndPlaceMesh(face: number) {
      goldberg.setGoldbergFaceColors([[face, face, new Color4(0, 1, 0, 1)]])
      for (let m = 0; m < 5 + 15 * Math.random(); m++) {
        const height = (1 + 2.5 * Math.random()) * radius / 10
        const mesh = MeshBuilder.CreateBox('box', {
          width: (1 + 0.5 * Math.random()) * radius / 10,
          depth: (1 + 0.5 * Math.random()) * radius / 10,
          height: height
        })
        goldberg.placeOnGoldbergFaceAt(mesh, face, new Vector3(2 * radius * Math.random() - radius, height / 2, 2 * radius * Math.random() - radius))
      }
    }

    function buildOnAdjacentFaces(face: number, count: number) {
      // copy adjacent faces array
      const adjCopy = goldberg.goldbergData.adjacentFaces.concat([])
      const visited = new Set()
      visited.add(face)
      setFaceColorAndPlaceMesh(face)
      let af = adjCopy[face]
      let ridx = Math.floor(Math.random() * af.length)
      let rf = af[ridx]
      visited.add(rf)
      af.splice(rf, 1)
      setFaceColorAndPlaceMesh(rf)
      let i = 0
      while (i < count && af.length > 0) {
        face = rf
        af = adjCopy[face]
        ridx = Math.floor(Math.random() * af.length)
        rf = af[ridx]
        // visited.add(rf)
        af.splice(rf, 1)
        while (visited.has(rf)) {
          ridx = Math.floor(Math.random() * af.length)
          rf = af[ridx]
          af.splice(rf, 1)
        }
        i++
        setFaceColorAndPlaceMesh(rf)
      }
    }

    buildOnAdjacentFaces(0, 50)
    buildOnAdjacentFaces(120, 60)

    return scene;
  }
}