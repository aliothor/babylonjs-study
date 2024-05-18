import { ArcRotateCamera, Color3, Color4, CubeTexture, Engine, HemisphericLight, MeshBuilder, PBRMaterial, Scene, SceneLoader, Vector3 } from "babylonjs";

export default class SheenInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sheen In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = Color4.FromColor3(Color3.Black())

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 2
    camera.upperRadiusLimit = 6

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16})
    const pbr = new PBRMaterial('pbr')
    sphere.material = pbr

    pbr.metallic = 0
    pbr.roughness = 0.5

    pbr.sheen.isEnabled = true

    scene.debugLayer.show({showExplorer: false})
    pbr.onBindObservable.add(function() {
      scene.debugLayer.select(pbr, 'SHEEN')
    })
  
    return scene;
  }
}