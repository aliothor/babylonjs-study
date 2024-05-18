import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, Vector3 } from "babylonjs";

export default class DisplayingFacetDataRef {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Displaying Facet Data to Reference'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity = 0.7

    const m = MeshBuilder.CreateIcoSphere('m', {radius: 2})
    m.updateFacetData()

    const box = MeshBuilder.CreateBox('box');

    let tmpVector = Vector3.Zero()
    let worldPos = Vector3.Zero()
    let worldNorm = Vector3.Zero()
    let boxPos = Vector3.Zero()
    const faceIndex = 10
    const distance = 2.0

    box.position = boxPos

    MeshBuilder.CreateLines('line', {points: [m.getFacetPosition(faceIndex), m.getFacetPosition(faceIndex).add(m.getFacetNormal(faceIndex))]}).parent = m

    let t = 0
    scene.registerBeforeRender(() => {
      m.getFacetPositionToRef(faceIndex, worldPos)
      m.getFacetNormalToRef(faceIndex, worldNorm)
      worldNorm.scaleToRef(distance, tmpVector)
      tmpVector.addToRef(worldPos, boxPos)

      m.rotation.y += 0.01
      m.rotation.z -= 0.005

      m.position.x = 2 * Math.sin(t)
      t += 0.01
      box.rotation.x += 0.05
    })

    return scene;
  }
}