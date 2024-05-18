import { ArcRotateCamera, Camera, Color3, Engine, FreeCamera, HemisphericLight, HighlightLayer, MeshBuilder, PointLight, Scene, Vector3, Viewport } from "babylonjs";

export default class MultiCamera {
  engine: Engine;
  
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Multi-Camera'
    this.engine = new Engine(this.canvas, true, {stencil: true});
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
    light.intensity = 0.7

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    sphere.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})

    const hl = new HighlightLayer('hl', scene, {camera: camera})
    hl.addMesh(sphere, Color3.Green())

    // ortho camera
    const orthoCamera = new FreeCamera('orthoCamera', new Vector3(0, 0, -2000))
    orthoCamera.mode = Camera.ORTHOGRAPHIC_CAMERA
    orthoCamera.viewport = new Viewport(0, 0, 0.25, 1)

    scene.activeCameras?.push(camera)
    scene.activeCameras?.push(orthoCamera)

    const orthoLayerMask = 0x10000000
    scene.activeCameras![0].layerMask = 0x0fffffff
    scene.activeCameras![1].layerMask = orthoLayerMask

    const orthoLamp = new PointLight('orthoLamp', new Vector3(-20, 50, -100))
    orthoLamp.includeOnlyWithLayerMask = orthoLayerMask

    const plane = MeshBuilder.CreatePlane('plane', {size: 200})
    plane.position = new Vector3(-4, -30, 0)
    plane.layerMask = orthoLayerMask

    return scene;
  }
}