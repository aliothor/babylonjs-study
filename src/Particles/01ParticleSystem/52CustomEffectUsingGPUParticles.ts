import {
  ArcRotateCamera,
  Color4,
  Engine,
  HemisphericLight,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
  WebGPUEngine,
  Effect,
  GPUParticleSystem,
} from "babylonjs";

export default class CustomEffectUsingGPUParticles {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "GPU Particles with Custom Effect";
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

    // const particleSystem = new ParticleSystem("particle", 10000, scene, effect);
    const particleSystem = new GPUParticleSystem(
      "particle",
      { capacity: 10000 },
      scene
    );
    particleSystem.particleTexture = new Texture(
      "https://playground.babylonjs.com/textures/flare.png"
    );

    particleSystem.emitter = Vector3.ZeroReadOnly;
    particleSystem.color1 = new Color4(1, 1, 0, 1.0);
    particleSystem.color2 = new Color4(1, 0.5, 0, 1);
    particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 1;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 5;
    particleSystem.emitRate = 100;

    particleSystem.updateSpeed = 0.005;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;

    particleSystem.direction1 = new Vector3(-1, 1, -1);
    particleSystem.direction2 = new Vector3(1, 1, 1);
    particleSystem.gravity = new Vector3(0, -1, 0);
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // shader
    Effect.ShadersStore["myParticleFragmentShader"] = /* wgsl */ `
      #ifdef GL_ES
      precision highp float;
      #endif
      varying vec2 vUV;         // provided by babylonjs
      varying vec4 vColor;      // provided by babylonjs
      uniform sampler2D diffuseSampler;   // provided by babylonjs
      uniform float time;       // custom

      void main(void) {
        vec2 position = vUV;
        float color = 0.0;
        vec2 center = vec2(0.5, 0.5);
        color = sin(distance(position, center) * 10.0 - time * vColor.g);
        vec4 baseColor = texture2D(diffuseSampler, vUV);
        gl_FragColor = baseColor * vColor * vec4(vec3(color, color, color), 1.0);
      }
    `;

    const effect = engine.createEffectForParticles(
      "myParticle",
      ["time"],
      [],
      "",
      undefined,
      undefined,
      undefined,
      particleSystem
    );

    let time = 0;
    let order = 0.1;
    effect.onBind = function () {
      effect.setFloat("time", time);
      time += order;
      if (time > 100 || time < 0) {
        order *= -1;
      }
    };

    particleSystem.setCustomEffect(effect, ParticleSystem.BLENDMODE_ONEONE);
    particleSystem.start();

    return scene;
  }
}
