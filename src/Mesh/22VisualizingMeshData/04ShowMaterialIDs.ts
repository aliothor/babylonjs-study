import {
  Engine,
  MeshDebugMode,
  MeshDebugPluginMaterial,
  PBRMaterial,
  Scene,
  SceneLoader,
} from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import "babylonjs-loaders";

export default class ShowMaterialIDs {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Show Material IDs";
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

    await SceneLoader.ImportMeshAsync(
      "",
      "/Meshes/FlightHelmet/",
      "FlightHelmet.gltf"
    );

    scene.createDefaultCameraOrLight(true, true, true);

    MeshDebugPluginMaterial.Reset();
    for (const mat of scene.materials) {
      new MeshDebugPluginMaterial(mat as PBRMaterial, {
        mode: MeshDebugMode.MATERIALIDS,
        multiply: false,
      });
    }

    createGUI();
    function createGUI() {
      const adt = AdvancedDynamicTexture.CreateFullscreenUI("UI");
      const button = Button.CreateSimpleButton("button", "Toggle plugin");
      button.width = "150px";
      button.height = "40px";
      button.color = "white";
      button.background = "green";
      button.cornerRadius = 20;
      button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      button.onPointerClickObservable.add(() => {
        for (const mat of scene.materials) {
          const plugin = mat.pluginManager?.getPlugin(
            "MeshDebug"
          ) as MeshDebugPluginMaterial;
          plugin.isEnabled = !plugin.isEnabled;
        }
      });
      adt.addControl(button);
    }

    return scene;
  }
}
