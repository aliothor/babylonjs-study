import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PointerEventTypes,
  Scene,
  SceneLoader,
  Texture,
  Vector3
} from "babylonjs";

export default class Fountain {
  constructor(private readonly scene: Scene) {
    this.Create();
  }
  Create(): void {
    // https://playground.babylonjs.com/textures/flare.png
    // 喷泉粒子
    const particleSystem = new ParticleSystem(
      "particleSystem",
      5000,
      this.scene
    );
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    // Where the particles come from
    particleSystem.emitter = new Vector3(-4, 0.8, -6); // emitted from the top of the fountain
    particleSystem.minEmitBox = new Vector3(-0.01, 0, -0.01); // Starting all from
    particleSystem.maxEmitBox = new Vector3(0.01, 0, 0.01); // To...

    // Colors of all particles
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.01;
    particleSystem.maxSize = 0.05;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;

    // Emission rate
    particleSystem.emitRate = 1500;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new Vector3(0, -9.81, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new Vector3(-1, 8, 1);
    particleSystem.direction2 = new Vector3(1, 8, -1);

    // Power and speed
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.6;
    particleSystem.updateSpeed = 0.01;

    const fountainProfile = [
      new Vector3(0, 0, 0),
      new Vector3(0.5, 0, 0),
      new Vector3(0.5, 0.2, 0),
      new Vector3(0.4, 0.2, 0),
      new Vector3(0.4, 0.05, 0),
      new Vector3(0.05, 0.1, 0),
      new Vector3(0.05, 0.8, 0),
      new Vector3(0.15, 0.9, 0)
    ];

    //Create lathed fountain
    const fountain = MeshBuilder.CreateLathe("fountain", {
      shape: fountainProfile,
      sideOrientation: Mesh.DOUBLESIDE
    });
    fountain.position.x = -4;
    fountain.position.z = -6;

    let switched = false;
    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          if (pointerInfo.pickInfo?.hit) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (pickedMesh === fountain) {
              switched = !switched;
            }
            if (switched) {
              particleSystem.start();
            } else {
              particleSystem.stop();
            }
          }
      }
    });
  }
}
