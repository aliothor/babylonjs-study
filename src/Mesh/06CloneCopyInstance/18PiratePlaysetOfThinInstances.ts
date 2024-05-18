import { ArcRotateCamera, CannonJSPlugin, Color3, CubeTexture, Engine, HDRCubeTexture, HemisphericLight, Matrix, Mesh, MeshBuilder, NodeMaterial, PhysicsImpostor, PhysicsJoint, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders';
import * as cannon from 'cannon';
window.CANNON = cannon

export default class PiratePlaysetOfThinInstances {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'a Pirate Playset Of Thin Instances'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    this.engine.displayLoadingUI()

    const camera = new ArcRotateCamera('camera', 2.34, 1.5, 135, new Vector3(-160, 30, 160));
    camera.attachControl(this.canvas, true);
    camera.upperAlphaLimit = 2.81
    camera.lowerAlphaLimit = 1.95
    camera.upperBetaLimit = 1.65
    camera.upperRadiusLimit = 218
    camera.lowerRadiusLimit = 100

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin)
    scene.environmentTexture = new HDRCubeTexture('https://BabylonJS.github.io/Assets/environments/umhlanga_sunrise_1k.hdr', scene, 128, false, true, false, true)

    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000})
    const skyMat = new StandardMaterial('skyBox')
    skyMat.backFaceCulling = false
    skyMat.reflectionTexture = new CubeTexture('https://BabylonJS.github.io/Assets/environments/toySky/toySky', scene)
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat.diffuseColor = new Color3(0, 0, 0)
    skyMat.specularColor = new Color3(0, 0, 0)
    skybox.material = skyMat

    SceneLoader.ImportMesh('stud', 'https://BabylonJS.github.io/Assets/meshes/', 'stud.glb', scene, (meshes) => {
      const parent = meshes[0]
      const stud = parent.getChildMeshes()[0] as Mesh
      stud.setParent(null)
      parent.dispose()

      NodeMaterial.ParseFromSnippetAsync('H1SHMG#1').then(mat => {
        stud.material = mat
        this.engine.hideLoadingUI()

        const sound = new Sound('pirateSong', 'https://BabylonJS.github.io/Assets/sound/pirateFun.mp3', scene, undefined, { autoplay: true, loop: true })
      })

      const oseanSize = 64
      const studDistance = 9
      const studArray: Matrix[] = []

      for (let x = -oseanSize / 2; x < oseanSize / 2; x++) {
        for (let z = -oseanSize / 2; z < oseanSize / 2; z++) {
          const matrix = Matrix.Translation(x * studDistance, 0, z * studDistance)
          studArray.push(matrix)
        }
      }

      stud.thinInstanceAdd(studArray)
      
    })

    // ship
    let shipPosition = new Vector3(-160, 0, 160)
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 50})
    const ground = MeshBuilder.CreateGround('ground', {width: 200, height: 200})
    const box = MeshBuilder.CreateBox('box', {size: 25})

    sphere.material = new StandardMaterial('sphereMat')
    sphere.material.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg')

    sphere.position.copyFrom(shipPosition)
    ground.position.copyFrom(shipPosition)
    box.position.copyFrom(shipPosition)

    sphere.position.y += 25
    box.position.y -= 50

    sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {mass: 1, friction: 10})
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {mass: 0})
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {mass: 200})

    const joint1 = new PhysicsJoint(PhysicsJoint.LockJoint, {})
    sphere.physicsImpostor.addJoint(box.physicsImpostor, joint1)

    let magnitude = 2000
    box.physicsImpostor.applyImpulse(new Vector3(-0.5 + Math.random(), 0, -0.5 + Math.random()).scale(magnitude), box.getAbsolutePosition())

    scene.onBeforeRenderObservable.add(() => {
      sphere.position = new Vector3(-160, 25, 160)
      let velocity = sphere.physicsImpostor!.getAngularVelocity()!
      velocity.y = 0
      sphere.physicsImpostor?.setAngularVelocity(velocity)
    })

    let interval = setInterval(function() {
      box.physicsImpostor?.applyImpulse(new Vector3(-0.5 + Math.random(), 0, -0.5 + Math.random()).scale(magnitude), box.getAbsolutePosition())
      console.log('4s');
      
    }, 4000)

    scene.onDisposeObservable.add(function() {
      clearInterval(interval)
    })
    
    SceneLoader.ImportMesh('', 'https://BabylonJS.github.io/Assets/meshes/', 'blackPearl.glb', scene, function(newMeshes) {
      newMeshes[0].position.copyFrom(shipPosition)
      newMeshes[0].setParent(sphere)
    })

    sphere.visibility = 0
    ground.visibility = 0
    box.visibility = 0

    return scene;
  }
}