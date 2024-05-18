import { ArcRotateCamera, Color3, Engine, FresnelParameters, HemisphericLight, Matrix, MeshBuilder, Plane, ReflectionProbe, RefractionTexture, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class FresnelRefraction {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Fresnel Refraction'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.upperBetaLimit = Math.PI / 2
    camera.lowerRadiusLimit = 4

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    // meshes
    const ySphere = MeshBuilder.CreateSphere('ySphere', {diameter: 1.5, segments: 16})
    ySphere.setPivotMatrix(Matrix.Translation(3, 0, 0))
    const ysMat = new StandardMaterial('ysMat')
    ysMat.diffuseColor = Color3.Yellow()
    ySphere.material = ysMat

    const gSphere = MeshBuilder.CreateSphere('gSphere', {diameter: 1.5, segments: 16})
    gSphere.setPivotMatrix(Matrix.Translation(0, 0, 3))
    const gsMat = new StandardMaterial('gsMat')
    gsMat.diffuseColor = Color3.Green()
    gSphere.material = gsMat

    // ground
    const ground = MeshBuilder.CreateBox('ground')
    ground.scaling = new Vector3(100, 0.01, 100)
    const gMat = new StandardMaterial('gMat')
    const gTex = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    gTex.uScale = 10
    gTex.vScale = 10
    gMat.diffuseTexture = gTex
    ground.material = gMat
    ground.position.y = -2

    // main
    const disc = MeshBuilder.CreateDisc('disc', {radius: 5, tessellation: 60})
    disc.position.y += 2

    const dMat = new StandardMaterial('dMat')
    disc.material = dMat

    const probe = new ReflectionProbe('probe', 512, scene)
    probe.renderList?.push(ySphere)
    probe.renderList?.push(gSphere)
    probe.renderList?.push(ground)

    dMat.diffuseColor = new Color3(1, 0.5, 0.5)
    dMat.refractionTexture = probe.cubeTexture
    dMat.indexOfRefraction = 1.06
    dMat.refractionFresnelParameters = new FresnelParameters()
    dMat.refractionFresnelParameters.bias = 0.1
    dMat.refractionFresnelParameters.power = 16
    dMat.refractionFresnelParameters.leftColor = Color3.Black()
    dMat.refractionFresnelParameters.rightColor = Color3.White()

    // animation
    scene.registerBeforeRender(function() {
      ySphere.rotation.y += 0.01
      gSphere.rotation.y += 0.01
    })


    return scene;
  }
}