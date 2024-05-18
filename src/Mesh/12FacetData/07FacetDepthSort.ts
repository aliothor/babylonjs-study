import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class FacetDepthSort {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Facet Depth Sort'
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 12, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat = new StandardMaterial('mat')
    mat.diffuseColor = Color3.Yellow()
    mat.alpha = 0.9

    const knot1 = MeshBuilder.CreateTorusKnot('knot1')
    knot1.material = mat
    knot1.position.x = -4

    const knot2 = MeshBuilder.CreateTorusKnot('knot2', {updatable: true})
    knot2.material = mat
    knot2.position.x = 4
    knot2.mustDepthSortFacets = true

    scene.registerBeforeRender(() => {
      knot1.rotation.y += 0.01

      knot2.rotation.y += 0.01
      knot2.updateFacetData()
    })


    return scene;
  }
}