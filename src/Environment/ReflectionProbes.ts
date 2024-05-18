import { ArcRotateCamera, Color3, Engine, FresnelParameters, HemisphericLight, Matrix, Mesh, MeshBuilder, MirrorTexture, Plane, ReflectionProbe, RenderTargetTexture, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ReflectionProbes {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Reflection Probe'
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
    camera.upperRadiusLimit = 50;
    camera.lowerRadiusLimit = 10;
    camera.upperBetaLimit = Math.PI / 2;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 创建网格
    const knot = MeshBuilder.CreateTorusKnot('knot', {
      radius: 1,
      tube: 0.4,
      radialSegments: 128,
      tubularSegments: 64
    });

    const ySphere = MeshBuilder.CreateSphere('ySphere', { diameter: 1.5, segments: 16 });
    ySphere.setPivotMatrix(Matrix.Translation(3, 0, 0), false);
    // ySphere.position = new Vector3(3, 0, 0);

    const bSphere = ySphere.clone('bSphere');
    bSphere.setPivotMatrix(Matrix.Translation(-1, 3, 0), false);

    const gSphere = ySphere.clone('gSphere');
    gSphere.setPivotMatrix(Matrix.Translation(0, 0, -3), false);

    // 镜面 地面
    const mirror = MeshBuilder.CreateBox('mirror');
    mirror.scaling = new Vector3(100, 0.01, 100);
    const mirMat = new StandardMaterial('mirMat');
    mirror.position.y = -2;
    mirror.material = mirMat;

    const diffTexture = new Texture('https://playground.babylonjs.com/textures/amiga.jpg');
    diffTexture.uScale = 10;
    diffTexture.vScale = 10;
    mirMat.diffuseTexture = diffTexture;

    const reflTexture = new MirrorTexture('mirorTex', 1024, scene, true);
    reflTexture.mirrorPlane = new Plane(0, -1, 0, -2);
    reflTexture.renderList = [ySphere, bSphere, gSphere, knot];
    reflTexture.level = 0.5;
    mirMat.reflectionTexture = reflTexture;

    // mian
    this._genSatelliteMat(knot, new Color3(1, 0.5, 0.5), [ySphere, bSphere, gSphere, mirror], scene);
    // Satellite
    this._genSatelliteMat(ySphere, Color3.Yellow(), [knot, bSphere, gSphere, mirror], scene);
    this._genSatelliteMat(bSphere, Color3.Blue(), [knot, ySphere, gSphere, mirror], scene);
    this._genSatelliteMat(gSphere, Color3.Green(), [knot, bSphere, ySphere, mirror], scene);


    this._addFog(scene); 

    scene.registerBeforeRender(() => {
      ySphere.rotation.y += 0.01;
      bSphere.rotation.y += 0.01;
      gSphere.rotation.y += 0.01;
    });
    
    return scene;
  }

  private _addFog(scene: Scene) {
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogColor = Color3.FromHexString(scene.clearColor.toHexString(true));
    scene.fogStart = 20;
    scene.fogEnd = 50;
  }

  private _genSatelliteMat(root: Mesh, color: Color3, meshes: Mesh[], scene: Scene) {
    const mat = new StandardMaterial('satelliteMat' + root.name);
    mat.diffuseColor = color;
    root.material = mat;

    const probe = new ReflectionProbe('satelliteProbe' + root.name, 512, scene);
    probe.renderList?.push(...meshes);

    mat.reflectionTexture = probe.cubeTexture;

    mat.reflectionFresnelParameters = new FresnelParameters({bias: 0.02});

    probe.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    probe.attachToMesh(root);
  }
}