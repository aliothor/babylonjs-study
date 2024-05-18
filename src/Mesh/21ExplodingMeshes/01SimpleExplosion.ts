import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MeshExploder,
  Scene,
  Vector3,
} from "babylonjs";

export default class SimpleExplosion {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Simple Explosion";
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
      20,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere1 = MeshBuilder.CreateSphere("sphere1", {
      diameter: 2,
      segments: 12,
    });
    // sphere1.position = new Vector3(0, 0, 0);
    sphere1.position.y = 2;
    const toExplodeArray = [];
    toExplodeArray.push(sphere1);
    for (let alpha = 0; alpha < 2 * Math.PI; alpha += Math.PI / 10) {
      const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 0.5,
        segments: 8,
      });
      sphere.position.y = 2;
      sphere.position.x = 1.25 * Math.sin(alpha);
      sphere.position.z = 1.25 * Math.cos(alpha);
      toExplodeArray.push(sphere);
    }

    const ground = MeshBuilder.CreateGround("ground", {
      width: 10,
      height: 10,
    });

    const newExplosion = new MeshExploder(toExplodeArray, ground);

    // newExplosion.explode(0);
    scene.registerBeforeRender(() => {
      const explode = Math.max(Math.sin(Date.now() / 1000) * 2, 0);

      newExplosion.explode(explode);
    });

    return scene;
  }
}
