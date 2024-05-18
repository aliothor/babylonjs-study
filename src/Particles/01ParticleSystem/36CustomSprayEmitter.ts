import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  IParticleEmitterType,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
  Matrix,
  Particle,
  UniformBuffer,
  Nullable,
  Scalar,
} from "babylonjs";
import { UniformBufferEffectCommonAccessor } from "babylonjs/Materials/uniformBufferEffectCommonAccessor";

export default class CustomSprayEmitter {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Custom Spray Emitter";
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
      20,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const particleSystem = new ParticleSystem("particle", 10000, scene);
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = Vector3.ZeroReadOnly;
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.2, 0.5, 1, 0);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 1500;

    particleSystem.updateSpeed = 0.005;
    particleSystem.minEmitPower = 4;
    particleSystem.maxEmitPower = 6;

    particleSystem.start();

    const sprayEmitter = new SprayParticleEmitter(2, 4);
    particleSystem.particleEmitterType = sprayEmitter;

    return scene;
  }
}

class SprayParticleEmitter implements IParticleEmitterType {
  radius: number;
  height: number;
  directionRandomizer: number;

  constructor(radius?: number, height?: number, directionRandomizer?: number) {
    this.radius = radius ?? 0.5;
    this.height = height ?? 1.0;
    this.directionRandomizer = directionRandomizer ?? 0;
  }
  startDirectionFunction(
    worldMatrix: Matrix,
    directionToUpdate: Vector3,
    particle: Particle,
    isLocal: boolean,
    inverseWorldMatrix: Matrix
  ): void {
    var direction = particle.position
      .subtract(worldMatrix.getTranslation())
      .normalize();
    var randX = Scalar.RandomRange(0, this.directionRandomizer);
    var randY = Scalar.RandomRange(0, this.directionRandomizer);
    var randZ = Scalar.RandomRange(0, this.directionRandomizer);
    if (
      direction.x * direction.x + direction.z * direction.z >
        0.1 * this.radius &&
      Math.abs(direction.y) > (0.1 * this.height) / 2
    ) {
      direction.x += randX;
      direction.y = randY;
      direction.z += randZ;
    } else {
      direction.x += randX;
      direction.y += randY;
      direction.z += randZ;
    }
    direction.normalize();
    Vector3.TransformNormalFromFloatsToRef(
      direction.x,
      direction.y,
      direction.z,
      worldMatrix,
      directionToUpdate
    );
  }
  startPositionFunction(
    worldMatrix: Matrix,
    positionToUpdate: Vector3,
    particle: Particle,
    isLocal: boolean
  ): void {
    var s = Scalar.RandomRange(0, Math.PI * 2);
    var h = Scalar.RandomRange(-0.5, 0.5);
    var radius = Scalar.RandomRange(0, this.radius);
    var randX = radius * Math.sin(s);
    var randZ = radius * Math.cos(s);
    var randY = h * this.height;
    Vector3.TransformCoordinatesFromFloatsToRef(
      randX,
      randY,
      randZ,
      worldMatrix,
      positionToUpdate
    );
  }
  clone(): IParticleEmitterType {
    throw new Error("Method not implemented.");
  }
  applyToShader(uboOrEffect: UniformBufferEffectCommonAccessor): void {
    throw new Error("Method not implemented.");
  }
  buildUniformLayout(ubo: UniformBuffer): void {
    throw new Error("Method not implemented.");
  }
  getEffectDefines(): string {
    throw new Error("Method not implemented.");
  }
  getClassName(): string {
    return "SprayParticleEmitter";
  }
  serialize() {
    throw new Error("Method not implemented.");
  }
  parse(serializationObject: any, scene: Nullable<Scene>): void {
    throw new Error("Method not implemented.");
  }
}
