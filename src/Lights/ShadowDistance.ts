import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, SpotLight, StandardMaterial, Vector3 } from "babylonjs";

export default class ShadowDistance {
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

    const camera = new ArcRotateCamera('camera', 0, 0.8, 90, new Vector3(0, 0, 0));
    camera.lowerBetaLimit = 0.1
    camera.upperBetaLimit = (Math.PI / 2) * 0.9
    camera.lowerRadiusLimit = 1
    camera.upperRadiusLimit = 150
    camera.attachControl(this.canvas, true);

    const light = new SpotLight('light', new Vector3(-40, 40, -40), new Vector3(1, -1, 1), Math.PI / 5, 30, scene);
    light.shadowMinZ = 10
    light.shadowMaxZ = 130

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 10})
    sphere.position = light.position
    const sMat = new StandardMaterial('sMat')
    sMat.emissiveColor = new Color3(1, 1, 0)
    sphere.material = sMat

    const box1 = MeshBuilder.CreateBox('box1');
    box1.scaling.y = 20
    box1.position = new Vector3(-10, 10, -10)

    const box2 = MeshBuilder.CreateBox('box2');
    box2.scaling.y = 10
    box2.position = new Vector3(0, 5, -10)

    const box3 = MeshBuilder.CreateBox('box3');
    box3.scaling.y = 10
    box3.position = new Vector3(-10, 5, 0)

    // ground
    const ground = MeshBuilder.CreateGround('ground', {width: 200, height: 200, subdivisions: 100})
    const gMat = new StandardMaterial('gMat')
    gMat.specularColor = new Color3(0, 0, 0)
    ground.material = gMat

    // shadow
    const shadowGen = new ShadowGenerator(1024, light)
    shadowGen.useContactHardeningShadow = true
    shadowGen.contactHardeningLightSizeUVRatio = 0.1
    shadowGen.setDarkness(0.5)

    shadowGen.addShadowCaster(box1)
    shadowGen.addShadowCaster(box2)
    shadowGen.addShadowCaster(box3)
    ground.receiveShadows = true

    // animation
    let alpha = 0
    let pause = false
    scene.registerBeforeRender(() => {
      if (pause) return
      box1.position.y = (Math.cos(alpha) * 0.5 + 0.5) * 20
      alpha += 0.05
    })

    document.onkeydown = (event) => {
      if (event.key == ' ') {
        pause = !pause
      }
    }

    return scene;
  }
}