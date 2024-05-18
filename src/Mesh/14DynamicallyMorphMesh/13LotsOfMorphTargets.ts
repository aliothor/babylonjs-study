import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, MorphTarget, MorphTargetManager, PBRMaterial, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Rectangle, Control, TextBlock } from "babylonjs-gui";

export default class LotsOfMorphTargets {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Lots of Morph Targets'
    const gl = this.canvas.getContext('webgl2');
    this.engine = new Engine(gl);
    // this.engine = new Engine(this.canvas);
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    scene.clearColor = Color4.FromInts(0, 0, 0, 255)

    const pbr = new PBRMaterial("pbr", scene);
    pbr.metallic = 0
    pbr.roughness = 0.75
    pbr.albedoColor = Color3.FromHexString("#295A84").toLinearSpace()
    pbr.sheen.isEnabled = true
    pbr.sheen.color = Color3.FromHexString("#34C2CA").toLinearSpace()
    pbr.sheen.intensity = 0.35
    pbr.backFaceCulling = false

    // create a flat ground and apply some sin to make it wave
    function createFlatGround(name: string, freq?: number, smooth?: number) {
      const ground = MeshBuilder.CreateGround(name, { width: 100, height: 100, subdivisions: 200, updatable: true })

      if (freq && smooth) {
        // wave it
        ground.updateMeshPositions((data) => {
          for (let i = 0; i < data.length; i += 3) {
            const x = data[i];
            data[i + 1] = Math.sin(x * 0.05 * freq) * smooth;
          }
        })
      }

      return ground
    }

    function addNewTarget(name: string, freq: number, add: number, manager: MorphTargetManager) {
      const ribbon = createFlatGround(name, freq, add)
      ribbon.setEnabled(false)
      const target = MorphTarget.FromMesh(ribbon)
      manager.addTarget(target)

      return target
    }

    // create main mesh
    const mianRibbon = createFlatGround('Main')
    mianRibbon.material = pbr

    const manager = new MorphTargetManager()
    mianRibbon.morphTargetManager = manager

    // create various targets
    const targets: MorphTarget[] = []
    const seeds: number[] = []
    for (let i = 0; i < 20; i++) {
      const target = addNewTarget('target' + i, Math.random() * 10 - 20, Math.random(), manager)

      seeds.push(Math.random())
      targets.push(target)
    }

    // animation
    scene.registerBeforeRender(() => {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i]
        const seed = seeds[i] + 0.01
        target.influence = Math.sin(seed)
        seeds[i] = seed
      }
    })


    // GUI
    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const rect1 = new Rectangle();
    rect1.height = "80px";
    rect1.top = "30px";
    rect1.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    rect1.color = "Orange";
    rect1.thickness = 1;
    rect1.adaptWidthToChildren = true;
    adt.addControl(rect1);

    const label = new TextBlock();
    label.text = " Using 20 morph targets \n to animate 80000 faces in realtime ";

    if (!manager.isUsingTextureForTargets) {
      label.text = " This demo requires a webgl2 capable device :( ";
    }

    label.textWrapping = false;
    label.resizeToFit = true;
    rect1.addControl(label);

    return scene;
  }
}