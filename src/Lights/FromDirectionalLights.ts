import { ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, StandardMaterial, Vector3 } from "babylonjs";

export default class FromDirectionalLights {
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
    scene.ambientColor =  Color3.FromHexString('#333333')

    const camera = new ArcRotateCamera('camera', 1, 1, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // light
    const light = new DirectionalLight('light', new Vector3(1, -1, 0), scene);
    light.intensity = 1
    light.position = new Vector3(-2, 2, 0)
    // light.setDirectionToTarget(Vector3.Zero())
    // light.autoCalcShadowZBounds = true
    // light.autoUpdateExtends = true

    const ltSphere = MeshBuilder.CreateSphere('ltSphere', {diameter: 0.5, segments: 16})
    ltSphere.position = light.position
    const ltMat = new StandardMaterial('ltMat')
    ltMat.emissiveColor = Color3.Yellow()
    ltMat.disableLighting = true
    ltSphere.material = ltMat

    // mesh
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 1, segments: 32})
    const sMat = new StandardMaterial('sMat')
    sMat.diffuseColor = Color3.White()
    sMat.ambientColor = Color3.White()
    sphere.material = sMat
    sphere.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2})
    ground.material = sMat
    ground.receiveShadows = true

    // shadow
    const sg = new ShadowGenerator(128, light)
    sg.useBlurExponentialShadowMap = true
    sg.addShadowCaster(sphere)

    // animation
    let t = 0
    let reverse = false
    scene.registerBeforeRender(() => {
      t += 0.1
      if (light.position.x > 2) reverse = true
      if (light.position.x < -2) reverse = false
      if (reverse) light.position.x -= 0.05
      else light.position.x += 0.05
      // light.setDirectionToTarget(Vector3.Zero())
    })

    return scene;
  }
}