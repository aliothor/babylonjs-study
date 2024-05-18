import { Color3, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, RecastJSPlugin, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { Recast } from 'recastjs';

export default class NavigationMesh {
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

    const camera = new FreeCamera('camera', new Vector3(-6, 4, -8));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // const box = MeshBuilder.CreateBox('box');

    this._createRecast(scene);



    return scene;
  }
  private async _createRecast(scene: Scene) {
    const recastInjection = await new Recast();
    const navigationPlugin = new RecastJSPlugin(recastInjection);
    // navigationPlugin.setWorkerURL('https://playground.babylonjs.com/workers/navMeshWorker.js');
    // navigationPlugin.setWorkerURL('navMeshWorker.js')

    const staticMesh = this._createStaticMesh(scene);
    var navmeshParameters = {
      cs: 0.2,
      ch: 0.2,
      walkableSlopeAngle: 90,
      walkableHeight: 1.0,
      walkableClimb: 1,
      walkableRadius: 1,
      maxEdgeLen: 12.,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 20,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
    };

    navigationPlugin.createNavMesh([staticMesh], navmeshParameters);

    const navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
    const matdebug = new StandardMaterial('matdebug');
    matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
    matdebug.alpha = 0.2;
    navmeshdebug.material = matdebug;
  }

  private _createStaticMesh(scene: Scene): Mesh {
    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6, subdivisions: 2});

    const mat = new StandardMaterial('mat');
    mat.diffuseColor = new Color3(1, 1, 1);

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 16});
    sphere.material = mat;
    sphere.position.y = 1;

    const cube = MeshBuilder.CreateBox('cube', {height: 3});
    cube.position = new Vector3(1, 1.5, 0);

    const mesh = Mesh.MergeMeshes([sphere, cube, ground]);

    return mesh!;
  }
}