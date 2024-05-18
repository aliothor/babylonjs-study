import { ArcRotateCamera, Color3, Engine, FreeCamera, HemisphericLight, LinesMesh, Matrix, MaxBlock, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, TransformNode, Vector3 } from "babylonjs";

export default class MeshCollision {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround('ground', {width: 30, height: 30});
    const gMat = new StandardMaterial('gMat');
    gMat.diffuseColor = Color3.White();
    gMat.backFaceCulling = false;
    ground.material = gMat;
    ground.position.y = -0.5;

    const bMat = new StandardMaterial('bMat');
    bMat.diffuseTexture = new Texture('https://playground.babylonjs.com/textures/crate.png');
    const box = MeshBuilder.CreateBox('box', {size: 2});
    box.material = bMat;
    box.checkCollisions = true;

    // 复制场景盒子
    const randNum = function(min: number, max: number) {
      return min + (max - min) * Math.random();
    }

    const boxNum = 6;
    let theta = 0;
    const radius = 6;
    box.position = new Vector3((radius + randNum(-radius / 2, radius / 2)) * Math.cos(theta + randNum(-theta / 10, theta / 10)),
      1,
      (radius + randNum(-radius / 2, radius / 2)) * Math.sin(theta + randNum(-theta / 10, theta / 10)));

    const boxes: Mesh[] = [box];
    for (let i = 1; i < boxNum; i++) {
      theta += 2 * Math.PI / boxNum;
      const newBox = box.clone('box' + i);
      boxes.push(newBox);
      newBox.position = new Vector3((radius + randNum(-radius / 2, radius / 2)) * Math.cos(theta + randNum(-theta / 10, theta / 10)),
        1,
        (radius + randNum(-radius / 2, radius / 2)) * Math.sin(theta + randNum(-theta / 10, theta / 10)));
    }

    // 场景主角
    const base = new Mesh('pviot');
    base.checkCollisions = true;

    const headDiam = 1.5;
    const bodyDiam = 2;
    const head = MeshBuilder.CreateSphere('h', {diameter: headDiam});
    head.parent = base;
    const body = MeshBuilder.CreateSphere('b', {diameter: bodyDiam});
    body.parent = base;
    head.position.y = 0.5 * (headDiam + bodyDiam);
    base.position.y = 0.5 * bodyDiam;

    // 可视化碰撞盒子
    const extra = 0.25;
    const offsetY = (bodyDiam + headDiam) / 2 - base.position.y;
    base.ellipsoid = new Vector3(bodyDiam / 2, (headDiam + bodyDiam) / 2,bodyDiam / 2);
    base.ellipsoid.addInPlace(new Vector3(extra, extra, extra));
    const a = base.ellipsoid.x;
    const b = base.ellipsoid.y;
    const points: Vector3[] = [];
    for (let i = -Math.PI / 2; i < Math.PI / 2; i += Math.PI / 36) {
      points.push(new Vector3(0, b * Math.sin(i) + offsetY, a * Math.cos(i)));
    }

    const ellipse: LinesMesh[] = [];
    ellipse[0] = MeshBuilder.CreateLines('e', {points: points});
    ellipse[0].color = Color3.Red();
    ellipse[0].parent = base;
    const steps = 12;
    theta = 2 * Math.PI / steps;
    for (let i = 1; i < steps; i++) {
      ellipse[i] = ellipse[0].clone('el' + i);
      ellipse[i].parent = base;
      ellipse[i].rotation.y = i * theta;
    }

    // 方向线
    const forward = new Vector3(0, 0, 1);
    const ptOffsetB = new Vector3(0, headDiam + extra, 0);
    const line = MeshBuilder.CreateLines('dir', {
      points: [base.position.add(ptOffsetB), base.position.add(ptOffsetB.add(forward.scale(3)))]
    });
    line.parent = base;

    // 键盘行为
    let angle = 0;
    let matrix = Matrix.Identity();
    let moveDir = new Vector3(0, 0, 1);

    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.event.key) {
        case "a":
        case "A":
          angle -= 0.1;
          base.rotation.y = angle;
          Matrix.RotationYToRef(angle, matrix);
          Vector3.TransformNormalToRef(forward, matrix, moveDir);
          break;
        case "d":
        case "D":
          angle += 0.1;
          base.rotation.y = angle;
          Matrix.RotationYToRef(angle, matrix);
          Vector3.TransformNormalToRef(forward, matrix, moveDir);
          break;
        case "w":
        case "W":
          base.moveWithCollisions(moveDir.scale(0.1));
          break;
        case "S":
        case 's':
          base.moveWithCollisions(moveDir.scale(-0.1));
          break;
      }
    });

    return scene;
  }
}