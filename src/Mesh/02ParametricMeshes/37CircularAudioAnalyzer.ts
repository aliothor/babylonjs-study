import { Analyser, ArcRotateCamera, Axis, Color4, CreateGreasedLine, Engine, GlowLayer, GreasedLineMeshColorMode, GreasedLineTools, MeshBuilder, MeshParticleEmitter, NoiseProceduralTexture, ParticleSystem, RawTexture, Scene, Sound, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export default class CircularAudioAnalyzer {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Circular Audio Analyzer'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    scene.clearColor = new Color4(0, 0, 0, 1)

    const numOfBars = 140
    const circularAnalyzerPoints = GreasedLineTools.GetCircleLinePoints(240, numOfBars * 2)

    const circularAnalyzerLine = CreateGreasedLine('circularAnalyzerLine', {
      points: circularAnalyzerPoints,
      updatable: true
    }, {
      // color: Color3.Red(),
      width: 30,
      sizeAttenuation: true,
      useDash: true,
      dashRatio: 0.4,
      dashCount: numOfBars,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })    
    circularAnalyzerLine.renderingGroupId = 1

    // texture
    const texColors = new Uint8Array([
      0, 240, 232,
      236, 0, 242,
      0, 240, 232,
      0, 37, 245
    ])
    const tex = new RawTexture(
      texColors,
      texColors.length / 3,
      1,
      Engine.TEXTUREFORMAT_RGB,
      scene,
      false,
      true,
      Engine.TEXTURE_LINEAR_NEAREST
    )
    tex.wrapU = RawTexture.WRAP_ADDRESSMODE
    tex.name = 'analyzer-texture'
    tex.uOffset = 1.4

    const mat = circularAnalyzerLine.material as StandardMaterial
    mat.emissiveTexture = tex

    // text
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const txt = new TextBlock()
    txt.text = 'NDFY - Masterful Heroes'
    txt.color = '#aaa'
    txt.fontSize = 16
    txt.paddingBottomInPixels = 64
    adt.addControl(txt)

    camera.zoomOnFactor = 1.2
    camera.zoomOn([circularAnalyzerLine])

    // glow
    const glow = new GlowLayer('glow', scene, {
      blurKernelSize: 200
    })
    glow.intensity = 1
    glow.referenceMeshToUseItsOwnMaterial(circularAnalyzerLine)

    // control
    startAudio()
    createAnalyzer()

    if (Engine.audioEngine) {
      Engine.audioEngine.onAudioUnlockedObservable.addOnce(() => {
        setTimeout(() => {
          createParticles(700)
        }, 1000);
      })
    }

    function startAudio() {
      const music = new Sound('music', 'https://playgrounds.babylonjs.xyz/MA_NDFY_MasterfulHeroes.mp3', scene, null, {
        loop: false,
        autoplay: true
      })
    }

    function createAnalyzer() {
      if (Engine.audioEngine) {
        const analyser = new Analyser()
        Engine.audioEngine.connectToAnalyser(analyser)
        analyser.BARGRAPHAMPLITUDE = 256
        analyser.FFT_SIZE = 512
        analyser.SMOOTHING = 0.8

        scene.onBeforeRenderObservable.add(() => {
          const frequecies = analyser.getByteFrequencyData()
          const widths = []
          for (let i = 0; i < numOfBars; i++) {
            const f = frequecies[i]
            const normalizedFrequency = Math.pow(f / 20, 3) / 2
            widths.push(normalizedFrequency / 40, normalizedFrequency / 40)
          }
          for (let i = numOfBars; i >= 0; i--) {
            const f = frequecies[i]
            const normalizedFrequency = Math.pow(f / 20, 3) / 2
            widths.push(normalizedFrequency / 40, normalizedFrequency / 40)
          }

          circularAnalyzerLine.widths = widths
          circularAnalyzerLine.rotate(Axis.Z, 0.01 * scene.getAnimationRatio())
        })
      } else {
        console.error('No Audio Engine.')
      }
    }

    function createParticles(count: number) {
      const emitter = MeshBuilder.CreateSphere('emitter', {diameter: 420})
      emitter.position.y = 25
      emitter.isVisible = false

      const particleSystem = new ParticleSystem('particles', count, scene)
      particleSystem.renderingGroupId = 0
      particleSystem.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png')
      const meshEmiter = new MeshParticleEmitter(emitter)
      particleSystem.particleEmitterType = meshEmiter

      particleSystem.emitter = emitter

      particleSystem.color1 = new Color4(1, 1, 1, 1)
      particleSystem.color2 = new Color4(0.2, 0.2, 0.2, 1)
      particleSystem.colorDead = new Color4(0, 0, 0.2, 0)

      particleSystem.minSize = 0.1
      particleSystem.maxSize = 5

      particleSystem.minLifeTime = 0.3
      particleSystem.maxLifeTime = 1.5

      particleSystem.emitRate = 1500

      particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE

      particleSystem.gravity = new Vector3(0, -10, 0)

      particleSystem.direction1 = new Vector3(-1, 4, 1)
      particleSystem.direction2 = new Vector3(1, 4, -1)

      particleSystem.minAngularSpeed = 0
      particleSystem.maxAngularSpeed = Math.PI

      particleSystem.minEmitPower = 0
      particleSystem.maxEmitPower = 0
      particleSystem.updateSpeed = 0.005

      const noiseTexture = new NoiseProceduralTexture('perlin', 256)
      noiseTexture.animationSpeedFactor = 5
      noiseTexture.persistence = 2
      noiseTexture.brightness = 0.5
      noiseTexture.octaves = 10

      particleSystem.noiseTexture = noiseTexture
      particleSystem.noiseStrength = new Vector3(100, 100, 100)

      particleSystem.start()
    }

    return scene;
  }
}