import {
  AbstractMesh,
  Animation,
  ArcRotateCamera,
  CannonJSPlugin,
  Color3,
  Color4,
  CubeTexture,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  IParticleSystem,
  ImageProcessingConfiguration,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  NoiseProceduralTexture,
  PBRMetallicRoughnessMaterial,
  ParticleHelper,
  ParticleSystem,
  PhysicsImpostor,
  Quaternion,
  Scene,
  SubEmitter,
  SubEmitterType,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";
import * as cannon from "cannon";
window.CANNON = cannon;

export default class HitSpaceToLaunchBarrel {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Hit Space to Launch a Barrel";
  }

  async InitScene() {
    const engine = await this.CreateEngine();
    const scene = await this.CreateScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  async CreateEngine(gpu: boolean = false): Promise<Engine> {
    if (gpu) {
      const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        const engine = new WebGPUEngine(this.canvas);
        await engine.initAsync();
        return engine;
      }
    }
    return new Engine(this.canvas);
  }

  async CreateScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      100,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const url = "https://playground.babylonjs.com/textures/";
    const hdrTexture = CubeTexture.CreateFromPrefilteredData(
      url + "Runyon_Canyon_A_2k_cube_specular.dds",
      scene
    );
    hdrTexture.name = "envTex";
    hdrTexture.gammaSpace = false;
    scene.environmentTexture = hdrTexture;

    scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 500, height: 500 },
      scene
    );

    const gMat = new PBRMetallicRoughnessMaterial("gMat");
    gMat.baseTexture = new Texture(url + "rockyGround_basecolor.png");
    gMat.normalTexture = new Texture(url + "rockyGround_normal.png");
    gMat.metallicRoughnessTexture = new Texture(
      url + "rockyGround_metalRough.png"
    );
    gMat.baseTexture.uScale = 40;
    gMat.baseTexture.vScale = 40;
    gMat.normalTexture.uScale = 40;
    gMat.normalTexture.vScale = 40;
    gMat.metallicRoughnessTexture.uScale = 40;
    gMat.metallicRoughnessTexture.vScale = 40;
    gMat.backFaceCulling = false;
    ground.material = gMat;

    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1;

    const pipeline = new DefaultRenderingPipeline("default", true);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;

    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYUP) {
        if (kbInfo.event.key === " ") {
          LaunchBarrel();
        }
      }
    });

    // Noise
    const noiseTexture1 = new NoiseProceduralTexture("perlin", 256, scene);
    noiseTexture1.animationSpeedFactor = 5;
    noiseTexture1.persistence = 0.2;
    noiseTexture1.brightness = 0.5;
    noiseTexture1.octaves = 4;

    // physics
    const gravityVector = new Vector3(0, -9.81, 0);
    const physicsPlugin = new CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.9 }
    );

    function LaunchBarrel() {
      // Create random position
      const min = -10.0;
      const max = 10.0;
      const randPosX = Math.random() * (max - min) + min;
      const randPosZ = Math.random() * (max - min) + min;
      const randAngX = Math.random() * (max / 2 - min / 3) + min / 3;
      const randAngY = Math.random() * (max * 2 - max * 1.25) + max * 1.25;
      const randAngz = Math.random() * (max / 2 - min / 3) + min / 3;
      const randRotX = Math.random() * (max / 5 - min / 5) + min / 5;
      const randRotY = Math.random() * (max / 5 - min / 5) + min / 5;
      const randRotZ = Math.random() * (max / 5 - min / 5) + min / 5;
      const randBounce = Math.floor(Math.random() * 4);
      let bounces = 0;
      let exploded = false;

      // Baarrel Object
      const explodingBarrel = MeshBuilder.CreateCylinder(
        "Barrel",
        { height: 1.33, diameter: 1 },
        scene
      );
      explodingBarrel.position = new Vector3(randPosX, 3, randPosZ);

      const barrelMat = new PBRMetallicRoughnessMaterial("barrelMat", scene);
      barrelMat.baseColor = new Color3(1.0, 0.0, 0.0);
      barrelMat.metallic = 0.0;
      barrelMat.roughness = 0.5;
      explodingBarrel.material = barrelMat;

      // Physics Imposter
      explodingBarrel.physicsImpostor = new PhysicsImpostor(
        explodingBarrel,
        PhysicsImpostor.CylinderImpostor,
        { mass: 1, restitution: 0.9 },
        scene
      );
      explodingBarrel.physicsImpostor.setLinearVelocity(
        new Vector3(randAngX, randAngY, randAngz)
      );
      explodingBarrel.physicsImpostor.setAngularVelocity(
        new Quaternion(randRotX, randRotY, randRotZ, 0).toEulerAngles()
      );

      explodingBarrel.physicsImpostor.registerOnPhysicsCollide(
        ground.physicsImpostor as PhysicsImpostor,
        () => {
          bounces++;
          if (bounces > randBounce && !exploded) {
            Explode(explodingBarrel.position);
            exploded = true;
            setTimeout(() => {
              explodingBarrel.physicsImpostor?.dispose();
              explodingBarrel.dispose(false, true);
            }, 0);
          }
        }
      );
    }

    function Explode(impact: Vector3) {
      // Create moving emitter for plume
      const emitterParent = MeshBuilder.CreateBox(
        "emitterParent",
        { size: 0.001 },
        scene
      );
      emitterParent.position = impact.clone();

      // Animate plume from explosion
      const plumeAnimation = new Animation(
        "plumeAnimation",
        "position.y",
        60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      // Animation keys and values
      const keys = [];
      keys.push({
        frame: 0,
        value: 0,
      });

      keys.push({
        frame: 10,
        value: 3,
      });

      keys.push({
        frame: 30,
        value: 9,
      });

      keys.push({
        frame: 50,
        value: 11,
      });

      keys.push({
        frame: 55,
        value: 11.5,
      });

      keys.push({
        frame: 60,
        value: 12,
      });

      // Adding keys to the emitter animation
      plumeAnimation.setKeys(keys);

      // Add animation to emitter
      emitterParent.animations.push(plumeAnimation);

      // Create default particle systems
      const flash = ParticleHelper.CreateDefault(impact, 40);
      const fireBlast = ParticleHelper.CreateDefault(impact, 1000);
      const blastSmoke = ParticleHelper.CreateDefault(impact, 250);
      const debris = ParticleHelper.CreateDefault(impact, 10);
      const shockwave = ParticleHelper.CreateDefault(impact, 300);
      const smokePillar = ParticleHelper.CreateDefault(impact, 1000);
      const secondaryBlast = ParticleHelper.CreateDefault(emitterParent, 1000);
      const secondarySmoke = ParticleHelper.CreateDefault(emitterParent, 500);
      const movingEmitters = [secondaryBlast, secondarySmoke];

      // Start animation for emitter
      scene.beginAnimation(emitterParent, 0, 60, false, 1, function () {
        DestoryEmitter(emitterParent, movingEmitters);
      });

      const fireBlastHemisphere = fireBlast.createHemisphericEmitter(0.2, 0);
      const blastSmokeHemisphere = blastSmoke.createHemisphericEmitter(3, 0.5);
      const debrisCone = debris.createConeEmitter(0.2, 2);
      const shockwaveCone = shockwave.createCylinderEmitter(1, 0.5, 0, 0);
      const secondaryBlastCone = secondaryBlast.createConeEmitter(2, 3);
      secondaryBlastCone.radiusRange = 1;
      const secondarySmokeCone = secondarySmoke.createConeEmitter(3, 2.5);
      secondarySmokeCone.radiusRange = 1;
      const smokePillarCone = smokePillar.createCylinderEmitter(0.1, 6, 1, 0);
      // const smokePillarCone = smokePillar.createBoxEmitter(2, 1);

      // Set emission rate
      flash.emitRate = 400;
      fireBlast.emitRate = 400;
      blastSmoke.emitRate = 200;
      debris.emitRate = 50;
      secondaryBlast.emitRate = 100;
      secondarySmoke.emitRate = 200;
      smokePillar.emitRate = 500;
      shockwave.emitRate = 2000;

      // Set particle scale
      flash.minScaleX = 10;
      flash.minScaleY = 70;
      flash.maxScaleX = 20;
      flash.maxScaleY = 100;

      fireBlast.minSize = 2;
      fireBlast.maxSize = 8;

      secondaryBlast.minSize = 8;
      secondaryBlast.maxSize = 16;

      debris.minSize = 0.5;
      debris.maxSize = 0.8;

      // Size over lifetime
      blastSmoke.addSizeGradient(0.0, 2.0, 6.0);
      blastSmoke.addSizeGradient(1.0, 4.0, 10.0);

      secondarySmoke.addSizeGradient(0.0, 2.0, 6.0);
      secondarySmoke.addSizeGradient(1.0, 4.0, 10.0);

      shockwave.addSizeGradient(0.0, 5.0, 8.0);
      shockwave.addSizeGradient(1.0, 10.0, 20.0);

      smokePillar.addSizeGradient(0.0, 1.0, 2.0);
      smokePillar.addSizeGradient(1.0, 2.0, 3.0);

      // Set particle lifetime
      flash.minLifeTime = 0.2;
      flash.maxLifeTime = 0.4;

      fireBlast.minLifeTime = 0.5;
      fireBlast.maxLifeTime = 1;

      secondaryBlast.minLifeTime = 0.5;
      secondaryBlast.maxLifeTime = 1;

      blastSmoke.minLifeTime = 3;
      blastSmoke.maxLifeTime = 5;

      secondarySmoke.minLifeTime = 3;
      secondarySmoke.maxLifeTime = 5;

      shockwave.minLifeTime = 3;
      shockwave.maxLifeTime = 4;

      smokePillar.minLifeTime = 3;
      smokePillar.maxLifeTime = 5;

      debris.minLifeTime = 1.2;
      debris.maxLifeTime = 1.2;

      // Set initial speed
      flash.minEmitPower = 10;
      flash.maxEmitPower = 30;

      fireBlast.minEmitPower = 30;
      fireBlast.maxEmitPower = 60;

      secondaryBlast.minEmitPower = 5;
      secondaryBlast.maxEmitPower = 10;

      blastSmoke.minEmitPower = 40;
      blastSmoke.maxEmitPower = 130;

      secondarySmoke.minEmitPower = 40;
      secondarySmoke.maxEmitPower = 170;

      debris.minEmitPower = 16;
      debris.maxEmitPower = 30;

      smokePillar.minEmitPower = 5;
      smokePillar.maxEmitPower = 10;

      shockwave.minEmitPower = 90;
      shockwave.maxEmitPower = 90;

      // Gravity
      debris.gravity = new Vector3(0, -20, 0);

      // Limit velocity over time
      fireBlast.addLimitVelocityGradient(0, 40);
      fireBlast.addLimitVelocityGradient(0.12, 12.983);
      fireBlast.addLimitVelocityGradient(0.445, 1.78);
      fireBlast.addLimitVelocityGradient(0.691, 0.502);
      fireBlast.addLimitVelocityGradient(0.93, 0.05);
      fireBlast.addLimitVelocityGradient(1.0, 0);

      fireBlast.limitVelocityDamping = 0.8;

      // secondaryBlast.addLimitVelocityGradient(0, 40);
      // secondaryBlast.addLimitVelocityGradient(0.120, 12.983);
      // secondaryBlast.addLimitVelocityGradient(0.445, 1.780);
      // secondaryBlast.addLimitVelocityGradient(0.691, 0.502);
      // secondaryBlast.addLimitVelocityGradient(0.930, 0.05);
      // secondaryBlast.addLimitVelocityGradient(1.0, 0);

      secondaryBlast.limitVelocityDamping = 0.9;

      blastSmoke.addLimitVelocityGradient(0.0, 1.0);
      blastSmoke.addLimitVelocityGradient(0.2, 0.95);
      blastSmoke.addLimitVelocityGradient(0.3, 0.9);
      blastSmoke.addLimitVelocityGradient(0.4, 0.8);
      blastSmoke.addLimitVelocityGradient(0.5, 0.7);
      blastSmoke.addLimitVelocityGradient(0.6, 0.6);
      blastSmoke.addLimitVelocityGradient(0.7, 0.5);
      blastSmoke.addLimitVelocityGradient(1.0, 0.3);

      blastSmoke.limitVelocityDamping = 0.6;

      secondarySmoke.addLimitVelocityGradient(0.0, 1.0);
      secondarySmoke.addLimitVelocityGradient(0.2, 0.95);
      secondarySmoke.addLimitVelocityGradient(0.3, 0.9);
      secondarySmoke.addLimitVelocityGradient(0.4, 0.8);
      secondarySmoke.addLimitVelocityGradient(0.5, 0.7);
      secondarySmoke.addLimitVelocityGradient(0.6, 0.6);
      secondarySmoke.addLimitVelocityGradient(0.7, 0.5);
      secondarySmoke.addLimitVelocityGradient(1.0, 0.3);

      secondarySmoke.limitVelocityDamping = 0.6;

      shockwave.addLimitVelocityGradient(0.0, 70);
      shockwave.addLimitVelocityGradient(0.25, 10);
      shockwave.addLimitVelocityGradient(0.5, 2);
      shockwave.addLimitVelocityGradient(1.0, 2);

      shockwave.limitVelocityDamping = 0.9;

      // Set particle color over time
      flash.addColorGradient(0, new Color4(1.0, 0.896, 0.0, 1.0));
      flash.addColorGradient(0.4, new Color4(0.7547, 0.1219, 0.0391, 1.0));
      flash.addColorGradient(0.8, new Color4(0.3679, 0.0721, 0.0295, 0.0));

      fireColor(fireBlast);
      fireColor(secondaryBlast);
      smokeColor(blastSmoke);
      smokeColor(secondarySmoke);
      smokeColor(smokePillar);

      shockwave.addColorGradient(
        0.0,
        new Color4(78 / 255, 64 / 255, 64 / 255, 0.0)
      );
      shockwave.addColorGradient(
        0.2,
        new Color4(68 / 255, 60 / 255, 60 / 255, 128 / 255)
      );
      shockwave.addColorGradient(
        0.3,
        new Color4(54 / 255, 47 / 255, 47 / 255, 60 / 255)
      );
      shockwave.addColorGradient(
        1.0,
        new Color4(54 / 255, 47 / 255, 47 / 255, 0.0)
      );
      shockwave.blendMode = ParticleSystem.BLENDMODE_MULTIPLY;

      // Initial particle rotation
      flash.minInitialRotation = -0.78539816;
      flash.maxInitialRotation = 0.78539816;

      initialRotation(fireBlast);
      initialRotation(secondaryBlast);
      initialRotation(blastSmoke);
      initialRotation(secondarySmoke);
      initialRotation(shockwave);
      initialRotation(smokePillar);

      // Rotation over lifetime
      smokeRotationOverLife(blastSmoke);
      smokeRotationOverLife(secondarySmoke);
      smokeRotationOverLife(shockwave);
      smokeRotationOverLife(smokePillar);

      // Particle texture settings
      flash.particleTexture = new Texture(
        "/Particles/FlashParticle.png",
        scene
      );
      flash.blendMode = ParticleSystem.BLENDMODE_ADD;

      setupAnimationSheet(
        fireBlast,
        "/Particles/FlameBlastSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        1,
        false
      );
      setupAnimationSheet(
        secondaryBlast,
        "/Particles/FlameBlastSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        1,
        false
      );
      setupAnimationSheet(
        blastSmoke,
        "/Particles/CloudSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        0,
        true
      );
      setupAnimationSheet(
        secondarySmoke,
        "/Particles/CloudSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        0,
        true
      );
      setupAnimationSheet(
        shockwave,
        "/Particles/CloudSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        0,
        true
      );
      setupAnimationSheet(
        smokePillar,
        "/Particles/CloudSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        0,
        true
      );

      // Sub emitters
      const fireSubEmitter = new SubEmitter(
        ParticleHelper.CreateDefault(impact, 200) as ParticleSystem
      );
      setupAnimationSheet(
        fireSubEmitter.particleSystem,
        "/Particles/FlameBlastSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        1,
        false
      );
      fireSubEmitter.particleSystem.emitter = new AbstractMesh("", scene);
      fireSubEmitter.particleSystem.minLifeTime = 0.5;
      fireSubEmitter.particleSystem.maxLifeTime = 0.8;
      fireSubEmitter.particleSystem.minEmitPower = 0;
      fireSubEmitter.particleSystem.maxEmitPower = 0;
      fireSubEmitter.particleSystem.emitRate = 130;
      fireSubEmitter.particleSystem.minSize = 0.8;
      fireSubEmitter.particleSystem.maxSize = 1.2;
      fireSubEmitter.particleSystem.addStartSizeGradient(0, 1);
      fireSubEmitter.particleSystem.addStartSizeGradient(0.7, 1);
      fireSubEmitter.particleSystem.addStartSizeGradient(1, 0.2);
      fireSubEmitter.particleSystem.targetStopDuration = 3;
      fireSubEmitter.particleSystem.minInitialRotation = -(Math.PI / 2);
      fireSubEmitter.particleSystem.maxInitialRotation = Math.PI / 2;
      fireSubEmitter.particleSystem.addColorGradient(
        0.0,
        new Color4(0.9245, 0.654, 0.0915, 1)
      );
      fireSubEmitter.particleSystem.addColorGradient(
        0.04,
        new Color4(0.9062, 0.6132, 0.0942, 1)
      );
      fireSubEmitter.particleSystem.addColorGradient(
        0.29,
        new Color4(0.7968, 0.3685, 0.1105, 1)
      );
      fireSubEmitter.particleSystem.addColorGradient(
        0.53,
        new Color4(0.6886, 0.1266, 0.1266, 1)
      );
      fireSubEmitter.particleSystem.addColorGradient(
        0.9,
        new Color4(0.3113, 0.0367, 0.0367, 1)
      );
      fireSubEmitter.particleSystem.addColorGradient(
        1.0,
        new Color4(0.3113, 0.0367, 0.0367, 1)
      );
      fireSubEmitter.type = SubEmitterType.ATTACHED;
      fireSubEmitter.inheritDirection = true;
      fireSubEmitter.particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

      const smokeSubEmitter = new SubEmitter(
        ParticleHelper.CreateDefault(impact, 600) as ParticleSystem
      );
      setupAnimationSheet(
        smokeSubEmitter.particleSystem,
        "/Particles/CloudSpriteSheet.png",
        1024,
        1024,
        4,
        4,
        0,
        true
      );
      smokeSubEmitter.particleSystem.emitter = new AbstractMesh("", scene);
      smokeSubEmitter.particleSystem.minLifeTime = 4;
      smokeSubEmitter.particleSystem.maxLifeTime = 7;
      smokeSubEmitter.particleSystem.minEmitPower = 0;
      smokeSubEmitter.particleSystem.maxEmitPower = 0;
      smokeSubEmitter.particleSystem.emitRate = 50;
      smokeSubEmitter.particleSystem.minSize = 1;
      smokeSubEmitter.particleSystem.maxSize = 2;
      smokeSubEmitter.particleSystem.addSizeGradient(0, 1);
      smokeSubEmitter.particleSystem.addSizeGradient(1, 3);
      smokeSubEmitter.particleSystem.addLifeTimeGradient(0, 6);
      smokeSubEmitter.particleSystem.addLifeTimeGradient(1, 0.7);
      smokeSubEmitter.particleSystem.targetStopDuration = 9;
      smokeSubEmitter.particleSystem.minInitialRotation = -(Math.PI / 2);
      smokeSubEmitter.particleSystem.maxInitialRotation = Math.PI / 2;
      // smokeSubEmitter.particleSystem.noiseTexture = noiseTexture1;
      // smokeSubEmitter.particleSystem.noiseStrength = new Vector3(5, 5, 5);
      smokeSubEmitter.particleSystem.addColorGradient(
        0.0,
        new Color4(175 / 255, 160 / 255, 160 / 255, 0.0)
      );
      smokeSubEmitter.particleSystem.addColorGradient(
        0.4,
        new Color4(175 / 255, 160 / 255, 160 / 255, 60 / 255)
      );
      // smokeSubEmitter.particleSystem.addColorGradient(0.9, new Color4(150/255, 140/255, 140/255, 60/255));
      // smokeSubEmitter.particleSystem.addColorGradient(0.0, new Color4(150/255, 140/255, 140/255, 1.0));
      smokeSubEmitter.particleSystem.addColorGradient(
        1.0,
        new Color4(150 / 255, 140 / 255, 140 / 255, 0.0)
      );
      smokeSubEmitter.type = SubEmitterType.ATTACHED;
      smokeSubEmitter.inheritDirection = true;
      smokeSubEmitter.particleSystem.blendMode =
        ParticleSystem.BLENDMODE_MULTIPLY;

      debris.subEmitters = [[fireSubEmitter, smokeSubEmitter]];

      // Particle system start
      flash.start();
      shockwave.start();
      fireBlast.start(30);
      secondaryBlast.start(90);
      blastSmoke.start(30);
      //smokePillar.start(30);
      secondarySmoke.start(30);
      debris.start();

      flash.targetStopDuration = 0.2;
      fireBlast.targetStopDuration = 0.9;
      secondaryBlast.targetStopDuration = 0.9;
      blastSmoke.targetStopDuration = 2.0;
      secondarySmoke.targetStopDuration = 2.0;
      debris.targetStopDuration = 0.2;
      shockwave.targetStopDuration = 0.5;
      // smokePillar.targetStopDuration = 2.0;

      // Animation update speed
      fireBlast.updateSpeed = 1 / 60;
      blastSmoke.updateSpeed = 1 / 60;

      // Rendering order
      shockwave.renderingGroupId = 0;
      debris.renderingGroupId = 1;
      blastSmoke.renderingGroupId = 1;
      fireBlast.renderingGroupId = 1;
      secondaryBlast.renderingGroupId = 1;
      secondarySmoke.renderingGroupId = 1;
      flash.renderingGroupId = 2;
    }

    function DestoryEmitter(
      meshToDestory: Mesh,
      movingEmitters: IParticleSystem[]
    ) {
      for (let i = 0; i < movingEmitters.length; i++) {
        movingEmitters[i].emitter = meshToDestory.position.clone();
      }
      meshToDestory.dispose();
    }

    // Color functions
    function fireColor(system: IParticleSystem) {
      system.addColorGradient(0.0, new Color4(0.9245, 0.654, 0.0915, 0.0));
      system.addColorGradient(
        0.04,
        new Color4(0.9062, 0.6132, 0.0942, 0.7 * 0.5)
      );
      system.addColorGradient(
        0.29,
        new Color4(0.7968, 0.3685, 0.1105, 0.86 * 0.5)
      );
      system.addColorGradient(
        0.53,
        new Color4(0.6886, 0.1266, 0.1266, 0.57 * 0.5)
      );
      system.addColorGradient(
        0.9,
        new Color4(0.3113, 0.0367, 0.0367, 0.11 * 0.5)
      );
      system.addColorGradient(1.0, new Color4(0.3113, 0.0367, 0.0367, 0.0));
      system.blendMode = ParticleSystem.BLENDMODE_ADD;
    }

    function smokeColor(system: IParticleSystem) {
      system.addColorGradient(
        0.0,
        new Color4(200 / 255, 200 / 255, 200 / 255, 0.0)
      );
      system.addColorGradient(
        0.2,
        new Color4(200 / 255, 200 / 255, 200 / 255, 128 / 255)
      );
      system.addColorGradient(
        0.3,
        new Color4(100 / 255, 100 / 255, 100 / 255, 60 / 255)
      );
      system.addColorGradient(
        1.0,
        new Color4(100 / 255, 100 / 255, 100 / 255, 0.0)
      );
      system.blendMode = ParticleSystem.BLENDMODE_MULTIPLY;
    }

    function initialRotation(system: IParticleSystem) {
      system.minInitialRotation = -Math.PI / 2;
      system.maxInitialRotation = Math.PI / 2;
    }

    function smokeRotationOverLife(system: IParticleSystem) {
      system.addAngularSpeedGradient(0, 0);
      system.addAngularSpeedGradient(1.0, -0.4, 0.4);
    }

    const setupAnimationSheet = function (
      system: IParticleSystem,
      texture: string,
      width: number,
      height: number,
      numSpritesWidth: number,
      numSpritesHeight: number,
      animationSpeed: number,
      isRandom: boolean
    ) {
      // Assign animation parameters
      system.isAnimationSheetEnabled = true;
      system.particleTexture = new Texture(texture, scene, false, false);
      system.spriteCellWidth = width / numSpritesWidth;
      system.spriteCellHeight = height / numSpritesHeight;
      const numberCells = numSpritesWidth * numSpritesHeight;
      system.startSpriteCellID = 0;
      system.endSpriteCellID = numberCells - 1;
      system.spriteCellChangeSpeed = animationSpeed;
      system.spriteRandomStartCell = isRandom;
      system.updateSpeed = 1 / 60;
    };

    return scene;
  }
}
