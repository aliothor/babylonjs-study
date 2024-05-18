import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import dat from "dat.gui";

export default class ParallaxMapping {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Parallax Mapping'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 100, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, false);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const box = MeshBuilder.CreateBox('box', {size: 50});

    const stoneDiffuseTexture = new Texture('/Materials/stone.png')
    const stoneNormalTexture = new Texture('/Materials/stone_normal.png')
    const brickwallDiffuseTexture = new Texture('/Materials/brickwall.png')
    const brickwallNormalTexture = new Texture('/Materials/brickwall_normal.png')
    let normalTexture = stoneNormalTexture

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = stoneDiffuseTexture
    mat.bumpTexture = stoneNormalTexture
    mat.useParallax = true
    mat.useParallaxOcclusion = true
    mat.parallaxScaleBias = 0.1
    mat.specularPower = 1000
    mat.specularColor = new Color3(.5, .5, .5)
    box.material = mat

    // gui
    // npm install --save dat.gui
    // npm i --save-dev @types/dat.gui
    const configObject = {
      scaleBias: 0.1,
      renderMode: 'Parallax Occlusion',
      texture: 'stone'
    }

    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '20px'
    gui.domElement.style.marginRight = '220px'
    gui.domElement.id = 'datGUI'

    gui.add(configObject, 'scaleBias', 0.05, 0.2).onChange(function(v) {
      mat.parallaxScaleBias = v
    })

    gui.add(configObject, 'renderMode', ['Parallax Occlusion', 'Parallax', 'Bump', 'Flat']).onChange(function(v) {
      switch(v) {
        case 'Flat':
          mat.bumpTexture = null
          break
        case 'Bump':
          mat.bumpTexture = normalTexture
          mat.useParallax = false
          break
        case 'Parallax':
          mat.bumpTexture = normalTexture
          mat.useParallax = true
          mat.useParallaxOcclusion = false
          break
        case 'Parallax Occlusion':
          mat.bumpTexture = normalTexture
          mat.useParallax = true
          mat.useParallaxOcclusion = true
          break
      }
    })

    gui.add(configObject, 'texture', ['stone', 'wall']).onChange(function(v) {
      switch(v) {
        case 'stone':
          mat.diffuseTexture = stoneDiffuseTexture
          normalTexture = stoneNormalTexture
          break
        case 'wall':
          mat.diffuseTexture = brickwallDiffuseTexture
          normalTexture = brickwallNormalTexture
          break
      }
      mat.bumpTexture = normalTexture
    })


    return scene;
  }
}