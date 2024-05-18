import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class IcosphereWithAnimationOverSubdivisions {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Icosphere With Animation Over Subdivisions'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 1, 0));
    camera.attachControl(this.canvas, true);
    camera.setPosition(new Vector3(10, 1, 0))
    camera.inertia = 0
    camera.angularSensibilityX = 250
    camera.angularSensibilityY = 250

    scene.clearColor = new Color4(0.1, 0.1, 0.1, 1)

    const light = new HemisphericLight('light', new Vector3(0, 15, 0), scene);
    light.intensity = 0.8
    light.diffuse = Color3.White()
    light.specular = Color3.Black()
    light.groundColor = Color3.Black()

    const pl0 = new PointLight('pl0', new Vector3(1, 5, 1))
    pl0.diffuse = Color3.Green()
    pl0.specular = Color3.Black()
    pl0.intensity = 0.9

    const pl1 = new PointLight('pl1', new Vector3(5, 1, 1))
    pl1.diffuse = Color3.Red()
    pl1.specular = Color3.Black()
    pl1.intensity = 0.9

    const plSphere0 = MeshBuilder.CreateSphere('plSphere0', { diameter: 0.2, segments: 16 })
    const mat0 = new StandardMaterial('mat0')
    mat0.diffuseColor = Color3.Black()
    mat0.specularColor = Color3.Black()
    mat0.emissiveColor = mat0.diffuseColor
    plSphere0.position = pl0.position

    const plSphere1 = MeshBuilder.CreateSphere('plSphere1', { diameter: 0.2, segments: 16 })
    const mat1 = new StandardMaterial('mat1')
    mat1.diffuseColor = Color3.Black()
    mat1.specularColor = Color3.Black()
    mat1.emissiveColor = mat1.diffuseColor
    plSphere1.position = pl1.position

    const tex = new Texture('/Meshes/stone.jpg')
    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = tex
    const sphere0 = MeshBuilder.CreateIcoSphere('sphere0', {
      radius: 2,
      subdivisions: 1
    })
    sphere0.material = mat

    const sphere1 = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:true, subdivisions: 2}, scene);
    sphere1.material = sphere0.material;
    const sphere2 = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:true, subdivisions: 4}, scene);
    sphere2.material = sphere0.material;
    const sphere3 = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:true, subdivisions: 8}, scene);
    sphere3.material = sphere0.material;
    const sphere4 = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:true, subdivisions: 16}, scene);
    sphere4.material = sphere0.material;

    const sphere0f = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:false, subdivisions: 1}, scene);
    sphere0f.material = sphere0.material;
    const sphere1f = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:false, subdivisions: 2}, scene);
    sphere1f.material = sphere0.material;
    const sphere2f = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:false, subdivisions: 4}, scene);
    sphere2f.material = sphere0.material;
    const sphere3f = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:false, subdivisions: 8}, scene);
    sphere3f.material = sphere0.material;
    const sphere4f = MeshBuilder.CreateIcoSphere("icosphere", {radius:2, flat:false, subdivisions: 16}, scene);
    sphere4f.material = sphere0.material;

    // Move the sphere upward 1/2 its height
    sphere0.position.y = 2;
    sphere1.position.y = sphere0.position.y;
    sphere2.position.y = sphere0.position.y;
    sphere3.position.y = sphere0.position.y;
    sphere4.position.y = sphere0.position.y;
    sphere0f.position.y = sphere0.position.y;
    sphere1f.position.y = sphere0.position.y;
    sphere2f.position.y = sphere0.position.y;
    sphere3f.position.y = sphere0.position.y;
    sphere4f.position.y = sphere0.position.y;

    // Let's try our built-in 'ground' shape.  Params: name, width, depth, subdivisions, scene
    const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10, subdivisions: 2 })
    ground.material = sphere0.material
    ground.position.y = -2

    // Animation
    let detail_count = 5
    let detail = 5
    let showdetail = 5
    let showflat = false
    let frame_count = 0;
    scene.onBeforeRenderObservable.add(() => {
      pl0.position.copyFromFloats(5.0 * Math.sin(frame_count / 100),
        2.0,
        5.0 * Math.cos(frame_count / 100));
      pl1.position.copyFromFloats(5.0 * Math.cos(2 * frame_count / 100),
        2.0 + 5.0 * Math.sin(2 * frame_count / 100),
        2.0);

      // Make sphere visible with increasing details every 100 frame
      // detail in 0, 1, 2, 3, 4
      // flat in 0, 1
      showdetail = Math.floor((frame_count / 64)) % (detail_count * 2);
      showflat = (showdetail >= detail_count);
      detail = showdetail % detail_count;
      // detail = 0; showflat = 1; // Uncomment to work only with single sphere
      sphere0.isVisible = (detail == 0 && showflat);
      sphere1.isVisible = (detail == 1 && showflat);
      sphere2.isVisible = (detail == 2 && showflat);
      sphere3.isVisible = (detail == 3 && showflat);
      sphere4.isVisible = (detail == 4 && showflat);
      sphere0f.isVisible = (detail == 0 && !showflat);
      sphere1f.isVisible = (detail == 1 && !showflat);
      sphere2f.isVisible = (detail == 2 && !showflat);
      sphere3f.isVisible = (detail == 3 && !showflat);
      sphere4f.isVisible = (detail == 4 && !showflat);

      frame_count++;
    })

    return scene;
  }
}