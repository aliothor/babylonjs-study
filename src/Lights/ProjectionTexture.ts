import { ArcRotateCamera, Color3, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, SpotLight, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class ProjectionTexture {
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

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 90, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.1;

    const url = 'https://playground.babylonjs.com/textures/';
    // spot
    const spLight = new SpotLight('spLight', new Vector3(30, 40, 30), new Vector3(-1, -2, -1), 1.1, 16, scene);
    spLight.projectionTexture = new Texture(`${url}co.png`);
    spLight.setDirectionToTarget(Vector3.Zero());
    spLight.intensity = 1.5;

    const ground = MeshBuilder.CreateGroundFromHeightMap(
      'ground',
      `${url}heightMap.png`,
      {width: 100, height: 100, subdivisions: 100, minHeight: 0, maxHeight: 10}
    );
    const gMat = new StandardMaterial('gMat');
    const texture = new Texture(`${url}ground.jpg`);
    texture.uScale = 6;
    texture.vScale = 6;
    gMat.diffuseTexture = texture;
    gMat.specularColor = new Color3(0, 0, 0);
    ground.position.y = -2.05;
    ground.material = gMat;

    // Animation
    let alpha = 0;
    scene.registerBeforeRender(() => {
      spLight.position = new Vector3(Math.cos(alpha) * 60, 40, Math.sin(alpha) * 60);
      spLight.setDirectionToTarget(Vector3.Zero());
      alpha += 0.01;
    });

    return scene;
  }
}