import { ArcRotateCamera, CSG, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, MultiMaterial, PointLight, ProceduralTexture, Scene, SceneLoader, StandardMaterial, Texture, Vector3, VolumetricLightScatteringPostProcess } from "babylonjs";
import 'babylonjs-procedural-textures'
import { BrickProceduralTexture } from "babylonjs-procedural-textures";

export default class VLSThroughCSG {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, 1.2, 20, new Vector3(0, 1, 0));
    camera.attachControl(this.canvas, false);
    camera.wheelPrecision = 50

    // const light = new PointLight('light', new Vector3(0, 40, 0), scene)
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    // light.specular = new Color3(1, 1, 1)
    light.intensity = 0.15

    // materials
    const aux1Mat = new StandardMaterial("aux1Mat");
    aux1Mat.wireframe = true;
    aux1Mat.backFaceCulling = false;
    aux1Mat.diffuseColor = new Color3(0, 1, 0);
    aux1Mat.emissiveColor = new Color3(0, .5, 0);

    const aux2Mat = new StandardMaterial("aux2Mat");
    aux2Mat.wireframe = true;
    aux2Mat.backFaceCulling = false;
    aux2Mat.diffuseColor = new Color3(1, 0, 0);
    aux2Mat.emissiveColor = new Color3(.5, 0, 0);

    const aux3Mat = new StandardMaterial("aux3Mat");
    aux3Mat.wireframe = true;
    aux3Mat.backFaceCulling = false;
    aux3Mat.diffuseColor = new Color3(1, 0, 1);
    aux3Mat.emissiveColor = new Color3(.5, 0, .5);

    const aux4Mat = new StandardMaterial("aux4Mat");
    aux4Mat.wireframe = true;
    aux4Mat.backFaceCulling = false;
    aux4Mat.diffuseColor = new Color3(0, 1, 1);
    aux4Mat.emissiveColor = new Color3(0, .5, .5);

    const aux5Mat = new StandardMaterial("aux5Mat");
    aux5Mat.wireframe = true;
    aux5Mat.backFaceCulling = false;
    aux5Mat.diffuseColor = new Color3(1, 1, 0);
    aux5Mat.emissiveColor = new Color3(.5, .5, 0);

    // meshes
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 4, segments: 16})
    const box1 = MeshBuilder.CreateBox('box1', {size: 4});
    const box2 = MeshBuilder.CreateBox('box2', {size: 4});
    const box3 = MeshBuilder.CreateBox('box3', {size: 8});
    const box4 = MeshBuilder.CreateBox('box4', {size: 8});
    const box5 = MeshBuilder.CreateBox('box5', {size: 8});
    const box6 = MeshBuilder.CreateBox('box6', {size: 8});
    // box6.showBoundingBox = true
    const cyl1 = MeshBuilder.CreateCylinder('cyl1', {height: 10, diameter: 11, subdivisions: 16})

    // apply materials
    sphere.material = aux3Mat
    box1.material = aux4Mat
    box2.material = aux5Mat

    box3.material = aux1Mat
    box4.material = aux1Mat
    box5.material = aux1Mat
    box6.material = aux1Mat
    cyl1.material = aux2Mat

    // meshes position
    box2.rotation.y += Math.PI / 8
    sphere.position = new Vector3(15, 3.5, 15)
    box1.position = new Vector3(15, 1, 15)
    box2.position = new Vector3(15, 2, 15)

    box3.position = new Vector3(-15, 3, 20)
    box3.rotation = new Vector3(0, 0, 0)
    box4.position = new Vector3(-15, 3, 20)
    box4.rotation = new Vector3(0, (Math.PI / 8), 0)
    box5.position = new Vector3(-15, 3, 20)
    box5.rotation = new Vector3(0, (Math.PI / 8) * 2, 0)
    box6.position = new Vector3(-15, 3, 20)
    box6.rotation = new Vector3(0, (Math.PI / 8) * 3, 0)
    cyl1.position = new Vector3(-15, 3, 20)
    cyl1.rotation = new Vector3(0, 0, 0)

    // csg-ify
    const sphereCSG = CSG.FromMesh(sphere)
    const box1CSG = CSG.FromMesh(box1);
    const box2CSG = CSG.FromMesh(box2);
    const box3CSG = CSG.FromMesh(box3);
    const box4CSG = CSG.FromMesh(box4);
    const box5CSG = CSG.FromMesh(box5);
    const box6CSG = CSG.FromMesh(box6);
    const cyl1CSG = CSG.FromMesh(cyl1);

    // Set up a MultiMaterial
    const mat0 = new StandardMaterial("mat0");
    mat0.diffuseColor.copyFromFloats(0.4, 0.1, 0.6);
    mat0.emissiveColor.copyFromFloats(0.1, 0, 0.2);
    mat0.backFaceCulling = false;

    const mat1 = new StandardMaterial("mat1");
    mat1.diffuseColor.copyFromFloats(0.2, 0.8, 0.2);
    mat1.emissiveColor.copyFromFloats(0, 0.2, 0);
    mat1.backFaceCulling = false;

    // go csg
    let subCSG = box1CSG.subtract(sphereCSG)
    let newMesh = subCSG.toMesh('csg', mat0)
    newMesh.position = new Vector3(-12, 0, 0)

    subCSG = sphereCSG.subtract(box1CSG)
    newMesh = subCSG.toMesh('csg2', mat0)
    newMesh.position = new Vector3(12, 0, 0)

    subCSG = sphereCSG.intersect(box1CSG)
    newMesh = subCSG.toMesh('csg3', mat0)
    newMesh.position = new Vector3(12, 0, 10)

    const multiMat = new MultiMaterial('multiMat')
    multiMat.subMaterials.push(mat0, mat1)

    subCSG = box1CSG.subtract(box2CSG)
    newMesh = subCSG.toMesh('csg4', multiMat, scene, true)
    newMesh.position = new Vector3(-12, 0,10)

    // 
    subCSG = cyl1CSG.subtract(box3CSG)
    subCSG = subCSG.subtract(box4CSG)
    subCSG = subCSG.subtract(box5CSG)
    subCSG = subCSG.subtract(box6CSG)
    newMesh = subCSG.toMesh('csg5', mat0)
    newMesh.position = new Vector3(0, 2, 0)
    newMesh.scaling = new Vector3(1, .8, 1)

    const brickMat = new StandardMaterial('auxMat')
    brickMat.diffuseTexture = new BrickProceduralTexture('brickme', 512)
    brickMat.emissiveColor = new Color3(.1, .1, .1)

    newMesh.material = brickMat

    // 
    const rad1 = MeshBuilder.CreatePlane('rad1', {size: 2})
    rad1.visibility = 1

    rad1.material = new StandardMaterial('bMat')
    rad1.material.diffuseColor = new Color3(0, 1, 0)
    rad1.material.emissiveColor = new Color3(1, 1, 1)
    rad1.material.backFaceCulling = false
    rad1.billboardMode = Mesh.BILLBOARDMODE_ALL
    // rad1.position = new Vector3(10, 5, 0)
    rad1.position = newMesh.position
    rad1.scalingDeterminant *= 2

    // ground 
    const grd = MeshBuilder.CreateGround('grd', {height: 50, width: 50, subdivisions: 1})
    grd.showBoundingBox = true
    grd.position = new Vector3(0, -2.02, 0)
    grd.rotation = new Vector3(0, 0, 0)
    grd.setEnabled(true)

    grd.material = new StandardMaterial('gmat')
    grd.material.backFaceCulling = false

    // rays
    const godrays = new VolumetricLightScatteringPostProcess(
      'godrays',
      1,
      camera,
      rad1,
      100,
      Texture.BILINEAR_SAMPLINGMODE,
      this.engine,
      false
    )
    godrays.exposure = 0.1
    godrays.decay = 0.96815
    godrays.weight = 0.98767
    godrays.density = 0.996

    const grTexture = 
    godrays.mesh.material.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/BJS-logo_v3.png')
    godrays.mesh.material.diffuseTexture.hasAlpha = true

    scene.registerBeforeRender(function() {
      newMesh.rotation.y -= .01
    })

    return scene;
  }
}