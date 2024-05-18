import { ActionManager, ArcRotateCamera, Engine, ExecuteCodeAction, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sprite, SpriteManager, Vector3 } from "babylonjs";

export default class SpriteAction {
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

    // 创建精灵
    const spriteManager = new SpriteManager(
      'spriteManager',
      'https://playground.babylonjs.com/textures/palm.png',
      2000,
      800,
      scene
    );

    // 具体精灵
    for (let i = 0; i < 2000; i++) {
      const tree = new Sprite('tree' + i, spriteManager);
      tree.position.x = Math.random() * 100 -50;
      tree.position.z = Math.random() * 100 -50;

      // 倒了
      if (Math.round(Math.random() * 5) == 0) {
        tree.angle = Math.PI / 2;
        tree.position.y = -0.3;
      }
    }

    // player
    const spriteManagerPlayer = new SpriteManager(
      'spriteManagerPlayer',
      'https://playground.babylonjs.com/textures/player.png',
      2,
      64,
      scene
    );
    spriteManagerPlayer.isPickable = true;

    // 第一个
    const player1 = new Sprite('player1', spriteManagerPlayer);
    player1.playAnimation(0, 40, true, 100);
    player1.position.y = -0.3;
    player1.size = 0.3;
    player1.isPickable = true;

    player1.actionManager = new ActionManager();
    player1.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickUpTrigger,
        () => {
          alert('player1 clicked');
        }
      )
    );

    // 第二个
    const player2 = new Sprite('player2', spriteManagerPlayer);
    player2.stopAnimation();
    player2.cellIndex = 2;
    player2.position.y = -0.3;
    player2.position.x = -1;
    player2.size = 0.3;
    player2.invertU = true;

    // 网格
    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 0.2, segments: 16});
    sphere.position.x = -2;
    sphere.actionManager = new ActionManager();
    sphere.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickUpTrigger,
        () => {
          alert('sphere clicked');
        }
      )
    );

    return scene;
  }
}