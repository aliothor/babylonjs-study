import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, ShadowGenerator, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class FromPointLights {
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

    const camera = new ArcRotateCamera('camera', 3 * Math.PI / 2, Math.PI / 8, 30, new Vector3(0, 0, 0));
    camera.lowerRadiusLimit = 5
    camera.upperRadiusLimit = 40
    camera.minZ = 0
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    // mesh
    const lightImpostor = MeshBuilder.CreateSphere('sphere', {diameter: 1, segments: 16})
    const liMat = new StandardMaterial('liMat')
    liMat.emissiveColor = Color3.Yellow()
    liMat.linkEmissiveWithDiffuse = true
    lightImpostor.material = liMat
    lightImpostor.parent = light

    const knot = MeshBuilder.CreateTorusKnot('knot', {radius: 2, tube: 0.2, radialSegments: 128, tubularSegments: 64, p: 4, q: 1})
    const torus = MeshBuilder.CreateTorus('torus', {diameter: 8, thickness: 1, tessellation: 32})

    const kMat = new StandardMaterial('kMat')
    kMat.diffuseColor = Color3.White()
    knot.material = kMat

    const tMat = new StandardMaterial('tMat')
    tMat.diffuseColor = Color3.Red()
    torus.material = tMat

    // container
    const container = MeshBuilder.CreateSphere('container', {segments: 16, diameter: 50, updatable: false, sideOrientation: Mesh.BACKSIDE})
    const cMat = new StandardMaterial('cMat')
    const cTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')
    cTexture.uScale = 10
    cTexture.vScale = 10
    cMat.diffuseTexture = cTexture
    container.material = cMat

    // shadow
    const sg = new ShadowGenerator(1024, light)
    sg.getShadowMap()?.renderList?.push(knot, torus)
    sg.setDarkness(0.5)
    sg.usePoissonSampling = true
    sg.bias = 0

    container.receiveShadows = true
    torus.receiveShadows = true

    scene.registerBeforeRender(() => {
      knot.rotation.y += 0.01
      knot.rotation.x += 0.01

      torus.rotation.y += 0.05
      torus.rotation.z += 0.03
    })

    return scene;
  }
}