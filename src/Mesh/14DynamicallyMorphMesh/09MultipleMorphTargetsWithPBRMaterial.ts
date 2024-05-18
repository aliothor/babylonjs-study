import { ArcRotateCamera, Color3, Engine, HDRCubeTexture, HemisphericLight, MeshBuilder, MorphTarget, MorphTargetManager, PBRMaterial, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";
import dat from "dat.gui";

export default class MultipleMorphTargetsWithPBRMaterial {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Multiple Morph Targets With PBR Material'
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

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 16 });
    const mat = new PBRMaterial('glass')
    sphere.material = mat

    const hdrTex = new HDRCubeTexture('https://playground.babylonjs.com/textures/room.hdr', scene, 512)
    const exposure = 0.6
    const contrast = 1.6
    mat.reflectionTexture = hdrTex
    mat.refractionTexture = hdrTex
    mat.linkRefractionWithTransparency = true
    mat.indexOfRefraction = 0.52
    mat.alpha = 0
    mat.cameraExposure = exposure
    mat.cameraContrast = contrast
    mat.microSurface = 1
    mat.reflectivityColor = new Color3(0.2, 0.2, 0.2)
    mat.albedoColor = new Color3(0.85, 0.85, 0.85)

    const manager = new MorphTargetManager()
    sphere.morphTargetManager = manager

    const sphere1 = MeshBuilder.CreateSphere('sphere1', { diameter: 2, segments: 16 })
    sphere1.setEnabled(false)
    sphere1.updateMeshPositions((data) => {
      for (let i = 0; i < data.length; i++) {
        data[i] += 0.4 * Math.random()
      }
    })

    const sphere2 = MeshBuilder.CreateSphere('sphere2', { diameter: 2, segments: 16 })
    sphere2.setEnabled(false)
    sphere2.scaling = new Vector3(2.1, 3.5, 1)
    sphere2.bakeCurrentTransformIntoVertices()

    const sphere3 = MeshBuilder.CreateSphere('sphere3', { diameter: 2, segments: 16 })
    sphere3.setEnabled(false)
    sphere3.updateMeshPositions((data) => {
      for (let i = 0; i < data.length; i++) {
        data[i] -= 0.4 * Math.random()
      }
    })

    const sphere4 = MeshBuilder.CreateSphere('sphere4', { diameter: 2, segments: 16 })
    sphere4.setEnabled(false)
    sphere4.scaling = new Vector3(1, 0.1, 1)
    sphere4.bakeCurrentTransformIntoVertices()

    const target1 = MorphTarget.FromMesh(sphere1, 'target1', 0.25)
    const target2 = MorphTarget.FromMesh(sphere2, 'target2', 0.25)
    const target3 = MorphTarget.FromMesh(sphere3, 'target3', 0.25)
    const target4 = MorphTarget.FromMesh(sphere4, 'target4', 0.25)
    manager.addTarget(target1)
    manager.addTarget(target2)
    manager.addTarget(target3)
    manager.addTarget(target4)

    // gui
    const gui = new dat.GUI
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'
    const options = {
      influence1: 0.25,
      influence2: 0.25,
      influence3: 0.25,
      influence4: 0.25,
    }

    gui.add(options, 'influence1', 0, 1).onChange((value) => { target1.influence = value })
    gui.add(options, 'influence2', 0, 1).onChange((value) => { target2.influence = value })
    gui.add(options, 'influence3', 0, 1).onChange((value) => { target3.influence = value })
    gui.add(options, 'influence4', 0, 1).onChange((value) => { target4.influence = value })

    const button = {
      switch: function () {
        if (sphere.morphTargetManager) {
          sphere.morphTargetManager = null
        } else {
          sphere.morphTargetManager = manager
        }
      }
    }
    gui.add(button, 'switch')

    return scene;
  }
}