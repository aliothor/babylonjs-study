import { Animation, ArcRotateCamera, Color3, CubeTexture, Curve3, Engine, HemisphericLight, Mesh, MeshBuilder, Path3D, Quaternion, Scene, Texture, UniversalCamera, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import { TriPlanarMaterial } from "babylonjs-materials";

export default class CameraFollowingPath {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Camera Following a Path'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 4, 15, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const url = 'https://playground.babylonjs.com/textures/'
    const heightMap = url + 'heightMap.png'
    const hdrTexture = new CubeTexture(url + "Runyon_Canyon_A_2k_cube_specular.env", scene);
    const skybox = scene.createDefaultSkybox(hdrTexture, true, 100, 0.1, true);
    const ground = MeshBuilder.CreateGroundFromHeightMap('ground', heightMap, { width: 10, height: 10, subdivisions: 500, minHeight: 0, maxHeight: 5 })
    // tri-planar material
    const triPlanarMat = new TriPlanarMaterial('triPlanarMat')
    triPlanarMat.diffuseTextureX = new Texture(url + 'rock.png')
    triPlanarMat.diffuseTextureY = new Texture(url + 'grass.png')
    triPlanarMat.diffuseTextureZ = new Texture(url + 'floor.png')
    triPlanarMat.normalTextureX = new Texture(url + 'rockn.png')
    triPlanarMat.normalTextureY = new Texture(url + 'grassn.png')
    triPlanarMat.normalTextureZ = new Texture(url + 'rockn.png')
    triPlanarMat.specularPower = 32
    triPlanarMat.tileSize = 5.0

    ground.material = triPlanarMat

    // mountain
    const mountainGroup = new Mesh('mountainGroup')
    const mountain1 = MeshBuilder.CreateGroundFromHeightMap('m1', heightMap, { width: 10, height: 10, subdivisions: 50, minHeight: 0, maxHeight: 3 })
    mountain1.position = new Vector3(-4, 0.001, -5)
    mountain1.material = triPlanarMat

    const mountain2 = MeshBuilder.CreateGroundFromHeightMap('m2', heightMap, { width: 15, height: 15, subdivisions: 50, minHeight: 0, maxHeight: 3.4 })
    mountain2.position = new Vector3(-1, 0.002, -7.5)
    mountain2.rotation.y = Math.PI / 2
    mountain2.material = triPlanarMat

    const mountain3 = MeshBuilder.CreateGroundFromHeightMap('m3', heightMap, { width: 8, height: 7, subdivisions: 30, minHeight: 0, maxHeight: 5 })
    mountain3.position = new Vector3(-5, 0.003, 4)
    mountain3.material = triPlanarMat

    const mountain4 = MeshBuilder.CreateGroundFromHeightMap('m4', heightMap, { width: 8, height: 8, subdivisions: 24, minHeight: 0, maxHeight: 3 })
    mountain4.position = new Vector3(-5, 0.004, 0)
    mountain4.rotation.y = -Math.PI / 12
    mountain4.material = triPlanarMat

    const mountain5 = MeshBuilder.CreateGroundFromHeightMap('m5', heightMap, { width: 10, height: 7, subdivisions: 18, minHeight: 0, maxHeight: 3.7 })
    mountain5.position = new Vector3(-2, 0.005, 6)
    mountain5.material = triPlanarMat

    const mountain6 = MeshBuilder.CreateGroundFromHeightMap('m6', heightMap, { width: 10, height: 7, subdivisions: 18, minHeight: 0, maxHeight: 4 })
    mountain6.position = new Vector3(2, 0.006, 5)
    mountain6.rotation.y = Math.PI / 4
    mountain6.material = triPlanarMat

    scene.fogStart = 10
    scene.fogEnd = 100
    scene.fogMode = Scene.FOGMODE_LINEAR
    scene.fogColor = Color3.FromHexString('#FDD6C9')

    // path
    const pathGroup = new Mesh('pathGroup')
    let v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);
    let curve = Curve3.CreateCubicBezier(v3(5, 0, 0), v3(2.5, 2.5, -0.5), v3(1.5, 2, -1), v3(1, 2, -2), 10);
    let curveCont = Curve3.CreateCubicBezier(v3(1, 2, -2), v3(0, 2, -4.5), v3(-2, 1, -3.5), v3(-0.75, 3, -2), 10);
    curve = curve.continue(curveCont);
    curveCont = Curve3.CreateCubicBezier(v3(-0.75, 3, -2), v3(0, 4, -1), v3(0.5, 4.5, 0), v3(-0.5, 4.75, 1), 10);
    curve = curve.continue(curveCont);
    curveCont = Curve3.CreateCubicBezier(v3(-0.5, 4.75, 1), v3(-1, 4.75, 1.5), v3(-1.5, 4, 2.5), v3(-2, 3, 3.5), 10);
    curve = curve.continue(curveCont);
    curveCont = Curve3.CreateCubicBezier(v3(-2, 3, 3.5), v3(-2.5, 2, 4), v3(-1, 2.5, 5), v3(0, 0, 5), 10);
    curve = curve.continue(curveCont);
    var curveMesh = MeshBuilder.CreateLines("bezier", { points: curve.getPoints() }, scene);
    curveMesh.color = new Color3(1, 1, 0.5);
    curveMesh.parent = pathGroup;

    // path3d
    const path3d = new Path3D(curve.getPoints())
    const tangents = path3d.getTangents()
    const normals = path3d.getNormals()
    const binormals = path3d.getBinormals()
    const curvePath = path3d.getCurve()

    // visualation
    for (let p = 0; p < curvePath.length; p++) {
      const tg = MeshBuilder.CreateLines('tg' + p, { points: [curvePath[p], curvePath[p].add(tangents[p])] })
      tg.color = Color3.Red()
      tg.parent = pathGroup
      const no = MeshBuilder.CreateLines('no' + p, { points: [curvePath[p], curvePath[p].add(normals[p])] })
      no.color = Color3.Blue()
      no.parent = pathGroup
      const bi = MeshBuilder.CreateLines('bi' + p, { points: [curvePath[p], curvePath[p].add(binormals[p])] })
      bi.color = Color3.Green()
      bi.parent = pathGroup
    }

    // animation camera
    const movingCamera = new UniversalCamera('movingCamera', Vector3.Zero())
    movingCamera.fov = Math.PI / 2
    movingCamera.minZ = 0.01
    movingCamera.maxZ = 25
    movingCamera.updateUpVectorFromRotation = true

    // define animations
    const frameRate = 60
    const posAnim = new Animation('cameraPos', 'position', frameRate, Animation.ANIMATIONTYPE_VECTOR3)
    const posKeys = []
    const rotAnim = new Animation('cameraRot', 'rotationQuaternion', frameRate, Animation.ANIMATIONTYPE_QUATERNION)
    const rotKeys = []

    for (let i = 0; i < curvePath.length; i++) {
      const position = curvePath[i]
      const tangent = tangents[i]
      const binormal = binormals[i]
      const rotation = Quaternion.FromLookDirectionRH(tangent, binormal)

      posKeys.push({ frame: i * frameRate, value: position })
      rotKeys.push({ frame: i * frameRate, value: rotation })
    }
    posAnim.setKeys(posKeys)
    rotAnim.setKeys(rotKeys)

    movingCamera.animations.push(posAnim)
    movingCamera.animations.push(rotAnim)

    // scene.activeCamera = movingCamera
    // scene.beginAnimation(movingCamera, 0, frameRate * curvePath.length, true)

    // gui
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const viewPathBtn = Button.CreateSimpleButton('viewPath', 'View Camera Path')
    viewPathBtn.width = 0.2
    viewPathBtn.height = '24px'
    viewPathBtn.background = 'black'
    viewPathBtn.color = 'white'
    viewPathBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    viewPathBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    let pathEnabled = false
    pathGroup.setEnabled(pathEnabled)
    viewPathBtn.onPointerClickObservable.add(() => {
      pathEnabled = !pathEnabled
      pathGroup.setEnabled(pathEnabled)
    })
    adt.addControl(viewPathBtn)

    const showOverheadBtn = Button.CreateSimpleButton('showOverhead', 'Use Overhead Camera')
    showOverheadBtn.width = 0.2
    showOverheadBtn.height = '24px'
    showOverheadBtn.background = 'black'
    showOverheadBtn.color = 'white'
    showOverheadBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    showOverheadBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    showOverheadBtn.onPointerClickObservable.add(() => {
      scene.activeCamera = camera
      scene.stopAnimation(movingCamera)
    })
    adt.addControl(showOverheadBtn)

    const showTrackBtn = Button.CreateSimpleButton('showTrack', 'Use Track Camera')
    showTrackBtn.width = 0.2
    showTrackBtn.height = '24px'
    showTrackBtn.background = 'black'
    showTrackBtn.color = 'white'
    showTrackBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    showTrackBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    showTrackBtn.onPointerClickObservable.add(() => {
      scene.activeCamera = movingCamera
      scene.beginAnimation(movingCamera, 0, frameRate * curvePath.length, true)
    })
    adt.addControl(showTrackBtn)

    return scene;
  }
}