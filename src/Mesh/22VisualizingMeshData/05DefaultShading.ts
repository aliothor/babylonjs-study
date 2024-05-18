import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  MeshDebugMode,
  MeshDebugPluginMaterial,
  PBRMaterial,
  Scene,
  SceneLoader,
  Vector3,
} from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import "babylonjs-loaders";

export default class DefaultShading {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Default Shading";
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
      "https://playground.babylonjs.com/scenes/Alien/",
      "Alien.gltf"
    );

    scene.createDefaultCameraOrLight(true, true, true);

    for (const mesh of scene.meshes) {
      MeshDebugPluginMaterial.PrepareMeshForTrianglesAndVerticesMode(
        mesh as Mesh
      );
    }

    for (const mat of scene.materials) {
      new MeshDebugPluginMaterial(mat as PBRMaterial, {
        mode: MeshDebugMode.TRIANGLES_VERTICES,
        multiply: true,
        shadedDiffuseColor: new BABYLON.Color3(1, 1, 0),
        shadedSpecularColor: new BABYLON.Color3(0.8, 0, 0.8),
        shadedSpecularPower: 10,
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
          plugin.multiply = !plugin.multiply;
        }
      });
      adt.addControl(button);
    }

    return scene;
  }
}
