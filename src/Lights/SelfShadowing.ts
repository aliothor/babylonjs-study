import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, ShadowGenerator, SpotLight, StandardMaterial, Vector3 } from "babylonjs";

export default class SelfShadowing {
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
    camera.setPosition(new Vector3(-20, 11, -20))

    const light = new SpotLight('light', new Vector3(-40, 40, -40), new Vector3(1, -1, 1), Math.PI / 5, 30, scene);

    // mesh
    const b1 = MeshBuilder.CreateBox('b1');
    b1.scaling.y = 10
    b1.position.y = 5
    b1.position.x = 0
    b1.position.z = -10

    const b2 = MeshBuilder.CreateBox('b2');
    b2.scaling.y = 10
    b2.position.y = 5
    b2.position.x = -10
    b2.position.z = 0

    const s = MeshBuilder.CreateSphere('s', {diameter: 3})
    s.position.y = 5
    s.position.x = -7
    s.position.z = -1

    const tk = MeshBuilder.CreateTorusKnot('tk', {radius: 2.7, tube: 0.5, radialSegments: 128, tubularSegments: 64, p: 2, q: 3})
    tk.position.y = 5
    tk.position.x = -1.5
    tk.position.z = -5

    // ground
    const ground = MeshBuilder.CreateGround('ground', {width: 200, height: 200, subdivisions: 100})
    const gMat = new StandardMaterial('gMat')
    gMat.specularColor = new Color3(0, 0, 0)
    ground.material = gMat

    // shadow
    const sg = new ShadowGenerator(1024, light)
    sg.bias = 0.001
    sg.normalBias = 0.02
    light.shadowMaxZ = 100
    light.shadowMinZ = 10
    sg.useContactHardeningShadow = true
    sg.contactHardeningLightSizeUVRatio = 0.05
    sg.setDarkness(0.5)

    sg.addShadowCaster(b1)
    sg.addShadowCaster(b2)
    sg.addShadowCaster(s)
    sg.addShadowCaster(tk)

    b1.receiveShadows = true
    b2.receiveShadows = true
    s.receiveShadows = true
    tk.receiveShadows = true
    ground.receiveShadows = true

    // animation
    let alpha = 0
    let add = true
    scene.registerBeforeRender(() => {
      if (!add) return
      tk.rotation.y = alpha
      tk.rotation.x = alpha * 0.5
      alpha += 0.005
    })

    document.onkeydown = (e) => {
      if (e.key == ' ') add = !add
    }

    return scene;
  }
}