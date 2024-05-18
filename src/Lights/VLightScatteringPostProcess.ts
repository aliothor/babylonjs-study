import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3, VolumetricLightScatteringPostProcess } from "babylonjs";

export default class VLightScatteringPostProcess {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', 0.5, 2.2, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, false);

    const light = new PointLight('light', new Vector3(20, 20, 100), scene);

    // mesh
    const url = 'https://playground.babylonjs.com/'
    SceneLoader.ImportMesh(
      '',
      `${url}scenes/`,
      'skull.babylon',
      scene,
      function (newMesh) {
        camera.target = newMesh[0].position

        newMesh[0].material = new StandardMaterial('skull')
        newMesh[0].material.emissiveColor = new Color3(0.2, 0.2, 0.2)
      }
    )

    // scatter
    const godrays = new VolumetricLightScatteringPostProcess(
      'godrays',
      1.0,
      camera,
      undefined,
      100,
      Texture.BILINEAR_SAMPLINGMODE,
      this.engine,
      false
    )

    godrays.mesh.material.diffuseTexture = new Texture(
      `${url}textures/sun.png`,
      scene,
      true,
      false,
      Texture.BILINEAR_SAMPLINGMODE
    )
    godrays.mesh.material.diffuseTexture.hasAlpha = true
    godrays.mesh.position = new Vector3(-150, 150, 150)
    godrays.mesh.scaling = new Vector3(350, 350, 350)

    light.position = godrays.mesh.position

    return scene;
  }
}