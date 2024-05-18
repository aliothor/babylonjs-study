import { ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, PointLight, Scene, SceneLoader, SpotLight, Vector3 } from "babylonjs";

export default class LightBeginner {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    // const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    // light.groundColor = new Color3(0, 1, 0);
    // const light = new PointLight('light', new Vector3(0, 1, 0), scene);
    // const light = new DirectionalLight('light', new Vector3(0, -1, 0), scene);
    // light.diffuse = new Color3(1, 0, 0);
    // light.specular = new Color3(0, 1, 0);

    
    // const sphere = MeshBuilder.CreateSphere('sphere');

    const ground = MeshBuilder.CreateGround('ground', {width: 4, height: 4});

    const rLight = new SpotLight('rLight', new Vector3(-0.6, 1, -0.5), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
    rLight.diffuse = new Color3(1, 0, 0);
    rLight.specular = new Color3(0, 1, 0);
    const gLight = new SpotLight('gLight', new Vector3(0.6, 1, -0.5), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
    gLight.diffuse = new Color3(0, 1, 0);
    gLight.specular = new Color3(0, 1, 0);
    const bLight = new SpotLight('rLight', new Vector3(0, 1, 0.5), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
    bLight.diffuse = new Color3(0, 0, 1);

    return scene;
  }
}