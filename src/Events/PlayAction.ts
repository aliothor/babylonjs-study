import { ActionManager, ArcRotateCamera, Color3, Color4, CombineAction, Engine, HemisphericLight, IncrementValueAction, InterpolateValueAction, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, SetStateAction, SetValueAction, StandardMaterial, StateCondition, Vector3 } from "babylonjs";

export default class PlayAction {
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
    scene.clearColor = new Color4(0, 0, 0, 1);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 300, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // 灯光
    const redLight = new PointLight('redLight', new Vector3(0, 50, 0), scene);
    const greenLight = new PointLight('greenLight', new Vector3(0, 50, 0), scene);
    const blueLight = new PointLight('blueLight', new Vector3(0, 50, 0), scene);
    
    redLight.diffuse = Color3.Red();
    greenLight.diffuse = Color3.Green();
    blueLight.diffuse = Color3.Blue();

    // 设置灯光状态
    redLight.state = 'on';
    greenLight.state = 'on';
    blueLight.state = 'on';

    // 地面
    const ground = MeshBuilder.CreateGround('ground', {width: 1000, height: 1000, updatable: false});
    const gMat = new StandardMaterial('gMat');
    gMat.specularColor = Color3.Black();
    ground.material = gMat;

    // 盒子
    const redBox = MeshBuilder.CreateBox('redBox', {size: 20});
    const redMat = new StandardMaterial('redMat');
    redMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    redMat.specularColor = new Color3(0.4, 0.4, 0.4);
    redMat.emissiveColor = Color3.Red();
    redBox.material = redMat;
    redBox.position.x = -100;

    const greenBox = MeshBuilder.CreateBox('greenBox', {size: 20});
    const greenMat = new StandardMaterial('greenMat');
    greenMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    greenMat.specularColor = new Color3(0.4, 0.4, 0.4);
    greenMat.emissiveColor = Color3.Green();
    greenBox.material = greenMat;
    greenBox.position.z = -100;

    const blueBox = MeshBuilder.CreateBox('blueBox', {size: 20});
    const blueMat = new StandardMaterial('blueMat');
    blueMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    blueMat.specularColor = new Color3(0.4, 0.4, 0.4);
    blueMat.emissiveColor = Color3.Blue();
    blueBox.material = blueMat;
    blueBox.position.x = 100;

    // 准备
    let prepareButton = function(mesh: Mesh, color: Color3, light: PointLight) {
      mesh.actionManager = new ActionManager();
      mesh.actionManager.registerAction(
        new CombineAction(
          ActionManager.OnPickTrigger,
          [
            new InterpolateValueAction(
              ActionManager.NothingTrigger,
              light,
              'diffuse',
              Color3.Black(),
              1000
            ),
            new SetStateAction(
              ActionManager.NothingTrigger,
              light,
              'off'
            ),
            new SetValueAction(
              ActionManager.NothingTrigger,
              mesh.material,
              'wireframe',
              true
            )
          ]
        )
      )?.then(
        new CombineAction(
          ActionManager.OnPickTrigger,
          [
            new InterpolateValueAction(
              ActionManager.NothingTrigger,
              light,
              'diffuse',
              color,
              1000
            ),
            new SetStateAction(
              ActionManager.NothingTrigger,
              light,
              'on'
            ),
            new SetValueAction(
              ActionManager.NothingTrigger,
              mesh.material,
              'wireframe',
              false
            )
          ]
        )
      )
    }
    prepareButton(redBox, Color3.Red(), redLight);
    prepareButton(greenBox, Color3.Green(), greenLight);
    prepareButton(blueBox, Color3.Blue(), blueLight);


    // 球
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 20, segments: 16});
    const sphereMat = new StandardMaterial('sphereMat');
    sphereMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    sphereMat.specularColor = new Color3(0.4, 0.4, 0.4);
    sphereMat.emissiveColor = Color3.Purple();
    sphere.material = sphereMat;
    sphere.position.z = 100;

    // 球相机旋转
    sphere.actionManager = new ActionManager();
    // 条件
    const conditionOff = new StateCondition(sphere.actionManager as ActionManager, redLight, 'off');
    const conditionOn = new StateCondition(sphere.actionManager as ActionManager, redLight, 'on');
    sphere.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnLeftPickTrigger,
        camera,
        'alpha',
        0,
        500,
        conditionOff
      )
    );
    sphere.actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnLeftPickTrigger,
        camera,
        'alpha',
        Math.PI,
        500,
        conditionOn
      )
    );

    // 鼠标滑过
    let makeOverOut = function(mesh: Mesh) {
      mesh.actionManager?.registerAction(
        new SetValueAction(
          ActionManager.OnPointerOverTrigger,
          mesh,
          'material.emissiveColor',
          Color3.White()
        )
      );
      mesh.actionManager?.registerAction(
        new SetValueAction(
          ActionManager.OnPointerOutTrigger,
          mesh,
          'material.emissiveColor',
          (mesh.material! as StandardMaterial).emissiveColor
        )
      );
      mesh.actionManager?.registerAction(
        new InterpolateValueAction(
          ActionManager.OnPointerOverTrigger,
          mesh,
          'scaling',
          new Vector3(1.1, 1.1, 1.1),
          150
        )
      );
      mesh.actionManager?.registerAction(
        new InterpolateValueAction(
          ActionManager.OnPointerOutTrigger,
          mesh,
          'scaling',
          new Vector3(1, 1, 1),
          150
        )
      );
    }
    makeOverOut(redBox);
    makeOverOut(greenBox);
    makeOverOut(blueBox);
    makeOverOut(sphere);

    // 盒子自转
    scene.actionManager = new ActionManager();
    let rotate = function(mesh: Mesh) {
      scene.actionManager.registerAction(
        new IncrementValueAction(
          ActionManager.OnEveryFrameTrigger,
          mesh,
          'rotation.y',
          0.01
        )
      );
    }
    rotate(redBox);
    rotate(greenBox);
    rotate(blueBox);

    // 


    // 甜甜圈
    const donut = MeshBuilder.CreateTorus('donut', {diameter: 20, thickness: 8, tessellation: 16});
    donut.position.y = 5;

    // 添加甜甜圈相交动作
    donut.actionManager = new ActionManager();
    donut.actionManager.registerAction(
      new SetValueAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: sphere
        },
        donut,
        'scaling',
        new Vector3(1.2, 1.2, 1.2)
      )
    );
    donut.actionManager.registerAction(
      new SetValueAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: sphere
        },
        donut,
        'scaling',
        new Vector3(1, 1, 1)
      )
    );
   
    // 动画
    let alpha = 0;
    scene.registerBeforeRender(() => {
      donut.position.x = Math.cos(alpha) * 100;
      donut.position.z = Math.sin(alpha) * 100;
      alpha += 0.01;
    });

    return scene;
  }
}