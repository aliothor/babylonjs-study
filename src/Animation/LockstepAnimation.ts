import { ArcRotateCamera, CannonJSPlugin, Color3, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, PhysicsEngine, PhysicsImpostor, Scene, SceneLoader, StandardMaterial, Vector3 } from "babylonjs";

export default class LockstepAnimation {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, {
      deterministicLockstep: true,
      lockstepMaxSteps: 4
    });
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    // const physEngine = new CannonJSPlugin(false);
    // scene.enablePhysics(new Vector3(0, -9.8, 0), physEngine);
    // physEngine.setTimeStep(1/60);
    scene.enablePhysics(new Vector3(0, -9.8, 0));

    const camera = new FreeCamera('camera', new Vector3(0, 5, -10));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere = MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2});
    sphere.position.y = 4;

    const ground = MeshBuilder.CreateGround('ground', {width: 15, height: 10, subdivisions: 2});

    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.position.x = -3;
    box.scaling.y = 0.5;
    box.scaling.z = 0.3;
    const mat = new StandardMaterial('boxMat');
    mat.emissiveColor = Color3.Blue();
    box.material = mat;

    sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, 
      {mass: 8, restitution: 0.9});
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor,
      {mass: 0, restitution: 0.9});

    scene.onBeforeStepObservable.add((theScene) => {
      console.log('logic, before anim and physics ' + theScene.getStepId());
      box.rotation.y += 0.05;
    });

    scene.onAfterStepObservable.add((theScene) => {
      console.log('logic, after anmi and physics ' + theScene.getStepId());
      if (sphere.physicsImpostor!.getLinearVelocity()!.length() < PhysicsEngine.Epsilon) {
        console.log('sphere is at rest on stepId: ' + theScene.getStepId());
        console.log('box.rotation.y is: ' + box.rotation.y);
        theScene.onAfterStepObservable.clear();
        theScene.onBeforeStepObservable.clear();
      }
    });

    return scene;
  }
}