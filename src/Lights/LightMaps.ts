import { ArcRotateCamera, Engine, HemisphericLight, Light, MeshBuilder, PointLight, Scene, SceneLoader, ShadowGenerator, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class LightMaps {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 25, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new PointLight('light', new Vector3(3, 3, 2), scene);
    light.intensity = 0.7;

    const lightMap = new Texture('https://playground.babylonjs.com/textures/candleopacity.png');
    const gMat = new StandardMaterial('gMat');
    gMat.lightmapTexture = lightMap;

    const ground = MeshBuilder.CreateGround('ground', {width: 20, height: 20, subdivisions: 4});
    ground.material = gMat;
    ground.receiveShadows = true;

    const sphere = MeshBuilder.CreateSphere('sphere');
    sphere.position.z = -1;
    sphere.position.y = 2;
    const shadowGen = new ShadowGenerator(1024, light);
    shadowGen.addShadowCaster(sphere);

    // move light
    let curTime = 0;
    scene.onBeforeRenderObservable.add(() => {
      curTime += this.engine.getDeltaTime();
      light.position.x = Math.sin(curTime /1000) * 5;
    });

    // spacebar change mode
    let mode = 0;
    document.onkeydown = (e) => {
      const keycode = e.key;
      if (keycode == ' ') {
        mode = ++mode % 3;
        if (mode == 1) {
          light.lightmapMode = Light.LIGHTMAP_SPECULAR;
        } else if (mode == 2) {
          light.lightmapMode = Light.LIGHTMAP_SHADOWSONLY;
        } else {
          light.lightmapMode = Light.LIGHTMAP_DEFAULT;
        }
      }
    }

    return scene;
  }
}