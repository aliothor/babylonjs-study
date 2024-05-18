import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, PBRMaterial, PBRSpecularGlossinessMaterial, Scene, Texture, Vector3 } from "babylonjs";

export default class CustomizingGlossinessSurfacesInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Customizing Glossiness Surfaces In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 2
    camera.upperRadiusLimit = 10

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    const pbr = new PBRMaterial('pbr')
    sphere.material = pbr

    pbr.albedoColor = new Color3(1, 0.766, 0.366)
    pbr.reflectionColor = new Color3(1, 0.766, 0.366)

    pbr.microSurface = 1
    // pbr.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)
    pbr.reflectionTexture = CubeTexture.CreateFromPrefilteredData('/Materials/environment.env', scene)
    pbr.reflectivityTexture = new Texture('https://playground.babylonjs.com/textures/sg.png')
    pbr.useMicroSurfaceFromReflectivityMapAlpha = true

    return scene;
  }
}