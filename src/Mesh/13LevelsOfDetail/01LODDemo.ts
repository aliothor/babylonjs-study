import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";

export default class LODDemo {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'LOD Demo'
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

    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = new Color3(0.49, 0.25, 0)
    const mat2 = new StandardMaterial('mat2')
    mat2.diffuseColor = new Color3(1, 0.5, 0.7)
    const mat3 = new StandardMaterial('mat3')
    mat3.diffuseColor = new Color3(0.8, 1, 0.7)
    const mat4 = new StandardMaterial('mat4')
    mat4.diffuseColor = new Color3(1, 1, 1)

    const knot1 = MeshBuilder.CreateTorusKnot('knot1', {radius: 0.5, tube: 0.2, radialSegments: 128, tubularSegments: 64, p: 2, q: 3})
    const knot2 = MeshBuilder.CreateTorusKnot('knot2', {radius: 0.5, tube: 0.2, radialSegments: 48, tubularSegments: 16, p: 2, q: 3})
    const knot3 = MeshBuilder.CreateTorusKnot('knot3', {radius: 0.5, tube: 0.2, radialSegments: 24, tubularSegments: 12, p: 2, q: 3})
    const knot4 = MeshBuilder.CreateTorusKnot('knot4', {radius: 0.5, tube: 0.2, radialSegments: 18, tubularSegments: 8, p: 2, q: 3})

    knot1.material = mat1
    knot2.material = mat2
    knot3.material = mat3
    knot4.material = mat4

    // knot1.addLODLevel(15, knot2)
    // knot1.addLODLevel(30, knot3)
    // knot1.addLODLevel(45, knot4)
    // knot1.addLODLevel(60, null)
    knot1.useLODScreenCoverage = true
    knot1.addLODLevel(0.3, knot2)
    knot1.addLODLevel(0.1, knot3)
    knot1.addLODLevel(0.01, knot4)
    knot1.addLODLevel(0.001, null)


    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const info = new TextBlock('info', camera.radius.toFixed(0))
    info.width = '80px'
    info.height = '100px'
    info.fontSize = 24
    info.color = 'white'
    info.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    adt.addControl(info)

    scene.onPointerMove = function(evt) {
      if (evt.type == 'wheel') {
        info.text = camera.radius.toFixed(0)
      }
    }

    return scene;
  }
}