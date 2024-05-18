import { ActionManager, ArcRotateCamera, Color3, Engine, ExecuteCodeAction, HemisphericLight, InterpolateValueAction, MeshBuilder, PredicateCondition, Scene, SetValueAction, StandardMaterial, Vector3 } from "babylonjs";

export default class ActionMeshes {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box');
    box.material = new StandardMaterial('mat');

    box.actionManager = new ActionManager();
    box.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPickTrigger,
        light,
        'diffuse',
        Color3.Blue(),
        1000
      )
    )?.then(
      new SetValueAction(
        ActionManager.NothingTrigger,
        box,
        'material.wireframe',
        true
      )
    ).then(
      new SetValueAction(
        ActionManager.NothingTrigger,
        box,
        'material.wireframe',
        false
      )
    ).then(
      new InterpolateValueAction(
        ActionManager.OnPickTrigger,
        light,
        'diffuse',
        Color3.Red(),
        2000
      )
    );

    box.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPickTrigger,
        camera,
        'alpha',
        0,
        500,
        new PredicateCondition(
          box.actionManager as ActionManager,
          () => {
            return light.diffuse.equals(Color3.Red());
          }
        )
      )
    );

    const sphere = MeshBuilder.CreateSphere('sphere');
    sphere.position.x = 3;

    box.actionManager.registerAction(
      new SetValueAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: {
            mesh: sphere,
            usePreciseInterscetion: true
          }
        },
        box,
        'scaling',
        new Vector3(1, 2, 1)
      )
    );

    box.actionManager.registerAction(
      new SetValueAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: {
            mesh: sphere,
            usePreciseInterscetion: true
          }
        },
        box,
        'scaling',
        new Vector3(1, 1, 1)
      )
    );

    let delta = 0;
    scene.registerBeforeRender(() => {
      box.position.x = Math.sin(delta) * 3;
      delta += 0.01;
    });

    // 场景的触发器
    scene.actionManager = new ActionManager();
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger,
          parameter: 'r'
        },
        () => {
          alert('r button pressed.');
        }
      )
    );

    return scene;
  }
}