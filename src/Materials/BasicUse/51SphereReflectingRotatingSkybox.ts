import { ArcRotateCamera, Color3, CubeTexture, Engine, HemisphericLight, Matrix, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class SphereReflectingRotatingSkybox {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Sphere Reflecting Rotating Skybox'
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

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = Color3.Red()

    // skybox
    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000})
    const skyMat = new StandardMaterial('skyMat')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skybox.material = skyMat

    // sphere
    const sphere = MeshBuilder.CreateSphere('sphere')
    const sMat = new StandardMaterial('sMat')
    sMat.backFaceCulling = true
    sMat.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', scene)
    sMat.diffuseColor = new Color3(0, 0, 0)
    sMat.specularColor = new Color3(0, 0, 0)
    sphere.material = sMat

    // adjust
    let theta = 0
    scene.registerBeforeRender(function() {
      Matrix.RotationYToRef(theta, sMat.reflectionTexture!.getReflectionTextureMatrix())
      theta += 0.015
    })

    return scene;
  }
}