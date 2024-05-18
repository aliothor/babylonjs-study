import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, MeshBuilder, PBRMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class IridescenceInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Iridescence In PBR'
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
    camera.upperRadiusLimit = 6

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)
    scene.createDefaultSkybox(scene.environmentTexture, true, undefined, 0.3, true)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    const pbr = new PBRMaterial('pbr')
    sphere.material = pbr

    pbr.metallic = 1
    pbr.roughness = 0
    pbr.albedoColor = new Color3(0.1, 0.1, 0.1)

    pbr.iridescence.isEnabled = true

    scene.debugLayer.show({showExplorer: false})
    pbr.onBindObservable.add(function() {
      scene.debugLayer.select(pbr, 'IRIDESCENCE')
    })
  
    return scene;
  }
}