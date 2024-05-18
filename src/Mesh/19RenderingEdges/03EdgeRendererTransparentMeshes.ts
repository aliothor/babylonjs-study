import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  StackPanel,
} from "babylonjs-gui";

export default class EdgeRendererTransparentMeshes {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Edge Renderer and Transparent Meshes";
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene();

    this.engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox("box", { size: 2 });
    box.position.y = 1.2;
    box.position.x = 2;
    box.enableEdgesRendering();
    box.edgesWidth = 8;
    box.edgesColor = new Color4(0, 0, 0.97);

    const box2 = MeshBuilder.CreateBox("box2", { size: 2 });
    box2.position.y = 1.2;
    box2.position.z = -5;
    // box2.visibility = 0.95;
    const mat = new StandardMaterial("mat");
    mat.alpha = 0.95;
    // mat.forceDepthWrite = true;
    box2.material = mat;
    // box2.renderingGroupId = 1;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 6,
      height: 6,
      subdivisions: 1,
    });
    ground.enableEdgesRendering();
    ground.edgesWidth = 3;

    const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel("panel");
    adt.addControl(panel);
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.adaptWidthToChildren = true;
    panel.spacing = 10;
    panel.paddingTopInPixels = 10;
    panel.paddingLeftInPixels = 10;

    const btnRenderingGrounpId = Button.CreateSimpleButton(
      "btnRenderingGrounpId",
      "Rendering Group ID: " + box2.renderingGroupId
    );
    panel.addControl(btnRenderingGrounpId);
    btnRenderingGrounpId.width = "300px";
    btnRenderingGrounpId.height = "40px";
    btnRenderingGrounpId.background = "green";
    btnRenderingGrounpId.color = "white";
    btnRenderingGrounpId.onPointerClickObservable.add(() => {
      box2.renderingGroupId = box2.renderingGroupId > 0 ? 0 : 1;
      btnRenderingGrounpId.textBlock!.text =
        "Rendering Group ID: " + box2.renderingGroupId;
    });

    const btnForceDepthWrite = Button.CreateSimpleButton(
      "btnRenderingGrounpId",
      "Force Depth Write: " + mat.forceDepthWrite
    );
    panel.addControl(btnForceDepthWrite);
    btnForceDepthWrite.width = "300px";
    btnForceDepthWrite.height = "40px";
    btnForceDepthWrite.background = "green";
    btnForceDepthWrite.color = "white";
    btnForceDepthWrite.onPointerClickObservable.add(() => {
      mat.forceDepthWrite = !mat.forceDepthWrite;
      btnForceDepthWrite.textBlock!.text =
        "Force Depth Write: " + mat.forceDepthWrite;
    });

    return scene;
  }
}
