import { ArcRotateCamera, Axis, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, Vector3, Vector4, Viewport } from "babylonjs";

export default class PictureVisual {
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

    this._addScene(scene);

    return scene;
  }

  private _addScene(scene: Scene) {
    const camera = new FreeCamera('camera', new Vector3(0, 5, 0));
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const pipCamera = new FreeCamera('pipCamera', new Vector3(0, 20, 0));
    pipCamera.setTarget(Vector3.Zero());

    // 调节比例
    let ar = this.engine.getAspectRatio(camera);
    let pipW = (ar < 1) ? 0.3 : 0.3 * (1 / ar);
    let pipH = (ar < 1) ? 0.3 * ar : 0.3;
    let pipX = 1 - pipW;
    let pipY = 1 - pipH;

    // 视口
    camera.viewport = new Viewport(0, 0, 1, 1);
    pipCamera.viewport = new Viewport(pipX, pipY, pipW, pipH);
    
    // 设置遮罩
    camera.layerMask = 0x30000000;  // 0x1000000 and 0x20000000;
    pipCamera.layerMask = 0x10000000;

    // 创建网格
    let head = this._createHead(scene);
  }

  private _createHead(scene: Scene): Mesh {
    const mat = new StandardMaterial('mat');
    const texture = new Texture('https:/i.imgur.com/vxH5bCg.jpg');
    mat.diffuseTexture = texture;

    const faceUV = new Array(6);
    faceUV[0] = new Vector4(0, 0.5, 1/3, 1);  // right
    faceUV[1] = new Vector4(1/3, 0, 2/3, 0.5);  // top
    faceUV[2] = new Vector4(2/3, 0, 1, 0.5); // bottom
    faceUV[3] = new BABYLON.Vector4(0, 0, 1 / 3, 0.5); // back
    faceUV[4] = new BABYLON.Vector4(1 / 3, 0.5, 2 / 3, 1); // front
    faceUV[5] = new BABYLON.Vector4(2 /3, 0.5, 1, 1); // left

    let options = {
      faceUV: faceUV,
      wrap: true
    }

    const head = MeshBuilder.CreateBox('head', options);
    head.rotate(Axis.Y, Math.PI);
    head.material = mat;
    head.layerMask = 0x10000000;

    return head;
  }
}