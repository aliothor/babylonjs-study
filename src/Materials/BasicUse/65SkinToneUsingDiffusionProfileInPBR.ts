import { ArcRotateCamera, Color3, CubeTexture, Engine, Matrix, Mesh, MeshBuilder, PBRMaterial, PointLight, Scene, SceneLoader, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class SkinToneUsingDiffusionProfileInPBR {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Skin Tone Using A Diffusion Profile In PBR'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.setTarget(new Vector3(0, 3, 0))

    // sphere light
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.5, segments: 32})
    const pbr = new PBRMaterial('metal')
    pbr.metallic = 0
    pbr.roughness = 1
    pbr.emissiveColor = new Color3(1, 1, 1)
    sphere.material = pbr
    sphere.setPivotMatrix(Matrix.Translation(0, 7, -8), false)

    const light = new PointLight('light', sphere.position, scene);
    light.diffuse = new Color3(1, 1, 1)
    light.specular = new Color3(1, 1, 1)
    light.intensity = 100

    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData('https://playground.babylonjs.com/textures/environment.dds', scene)
    scene.createDefaultSkybox(scene.environmentTexture, true)

    scene.debugLayer.show({showExplorer: false})

    let mainMesh: Mesh
    SceneLoader.ImportMesh('', 'https://models.babylonjs.com/Lee-Perry-Smith-Head/', 'head.glb', scene, function(meshes) {
      meshes[0].scaling.scaleInPlace(20)

      mainMesh = meshes[1]
      const pbr = mainMesh.material as PBRMaterial
      pbr.subSurface.isScatteringEnabled = true
      pbr.metallic = 0
      pbr.roughness = 0.67
      // pbr.subSurface.isTranslucencyEnabled = true
      pbr.subSurface.scatteringDiffusionProfile = new Color3(0.75, 0.25, 0.2)
      mainMesh.material = pbr

      scene.enableSubSurfaceForPrePass()!.metersPerUnit = 0.07
      scene.enablePrePassRenderer()!.samples = 8

      scene.debugLayer.select(mainMesh.material, 'SUBSURFACE')
    })

    scene.registerAfterRender(() => {
      sphere.rotation.y += 0.01
      light.position = sphere.getAbsolutePosition()
    })


    return scene;
  }
}