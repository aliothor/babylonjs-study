import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MeshExploder,
  Scene,
  Vector3,
} from "babylonjs";

export default class LargerExplosion {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Larger Explosion";
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
      100,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const num = 2000;
    const spheres = [];
    for (let i = 0; i < num; i++) {
      const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 1 + Math.random() * 2,
        segments: 8,
      });
      sphere.position = Vector3.Random(-1, 1);
      let pos = sphere.position.clone();
      pos = pos.normalize();
      sphere.position = Vector3.Minimize(pos, sphere.position);
      spheres.push(sphere);
    }

    const ground = MeshBuilder.CreateGround("ground", {
      width: 20,
      height: 20,
    });

    const newExplosion = new MeshExploder(spheres, ground);

    scene.registerBeforeRender(() => {
      const n = Date.now() / 1000;
      camera.alpha += 0.01;
      camera.radius = (Math.sin(n / 2) + 2) * 100;

      let explode = 0;
      if (Math.sin(n * 2) > 0) {
        explode = Math.sin(n) * 100;
      } else {
        explode = 0;
      }
      newExplosion.explode(explode);
    });

    return scene;
  }
}
