import { ArcRotateCamera, Color3, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, SpotLight, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ShadowPCF {
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

    const camera = new FreeCamera('camera', new Vector3(0, 10, -20));
    camera.setTarget(Vector3.Zero())
    camera.attachControl(this.canvas, true);

    const light = new SpotLight('light', new Vector3(0, 20, -10), new Vector3(0, -1, 0.3), 1.2, 24, scene);

    const box = MeshBuilder.CreateBox('box', {size: 5, updatable: false});
    box.position = new Vector3(0, 5, 0)

    const bMat = new StandardMaterial('bMat')
    bMat.diffuseColor = new Color3(1, 0, 0)
    bMat.specularColor = new Color3(0.5, 0, 0)
    box.material = bMat

    // ground
    const ground = MeshBuilder.CreateGround('ground', {width: 24, height: 60, subdivisions: 1, updatable: false})

    const gMat = new StandardMaterial('gMat')
    gMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/ground.jpg')
    gMat.specularColor = new Color3(0, 0, 0)
    gMat.emissiveColor = new Color3(0.2, 0.2, 0.2)
    ground.material = gMat
    ground.receiveShadows = true

    // shadow
    const shadowGen = new ShadowGenerator(512, light)
    shadowGen.addShadowCaster(box)
    shadowGen.usePercentageCloserFiltering = true
    shadowGen.filteringQuality = ShadowGenerator.QUALITY_LOW

    return scene;
  }
}